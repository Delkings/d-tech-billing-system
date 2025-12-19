const express = require("express");
const axios = require("axios");
const moment = require("moment");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

//  MPESA CREDENTIALS
// For testing, use sandbox credentials from https://developer.safaricom.co.ke/
const shortcode = "174379"; // Sandbox test shortcode
const consumerKey = "YOUR_CONSUMER_KEY";
const consumerSecret = "YOUR_CONSUMER_SECRET";
const passkey = "YOUR_PASSKEY";
const baseUrl = "https://sandbox.safaricom.co.ke";

//IN-MEMORY DATABASE 
let transactions = [];
let initiatedPayments = new Map(); // Track initiated payments by transaction ID

//  ACCESS TOKEN 
async function getAccessToken() {
    try {
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
        const res = await axios.get(
            `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
            { headers: { Authorization: `Basic ${auth}` } }
        );
        return res.data.access_token;
    } catch (error) {
        console.error("Error getting access token:", error.message);
        throw error;
    }
}

//  GENERATE PASSWORD 
function generatePassword(shortcode, passkey, timestamp) {
    const data = shortcode + passkey + timestamp;
    return Buffer.from(data).toString("base64");
}

// INITIATE STK PUSH 
app.post("/api/deposit", async (req, res) => {
    try {
        const { phone, amount } = req.body;

        // Validation
        if (!phone || !amount) {
            return res.status(400).json({
                success: false,
                message: "Phone number and amount are required"
            });
        }

        if (amount < 2) {
            return res.status(400).json({
                success: false,
                message: "Minimum deposit amount is KES 2"
            });
        }

        if (amount > 70000) {
            return res.status(400).json({
                success: false,
                message: "Maximum deposit amount is KES 70,000"
            });
        }

        // Format phone number (254XXXXXXXXX)
        let formattedPhone = phone.toString().trim();
        if (formattedPhone.startsWith("0")) {
            formattedPhone = "254" + formattedPhone.substring(1);
        } else if (formattedPhone.startsWith("+254")) {
            formattedPhone = formattedPhone.substring(1);
        }

        const timestamp = moment().format("YYYYMMDDHHmmss");
        const password = generatePassword(shortcode, passkey, timestamp);
        const accessToken = await getAccessToken();

        // Generate unique transaction reference
        const transactionRef = "TX" + Date.now() + Math.floor(Math.random() * 1000);

        const stkPayload = {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: formattedPhone,
            PartyB: shortcode,
            PhoneNumber: formattedPhone,
            CallBackURL: "https://your-domain.com/api/callback", // PLACE YOUR DOMAIN HERE 
            AccountReference: "DELTECH-ISP",
            TransactionDesc: `Deposit to DELTECH Wallet`
        };

        // Store initiated payment
        initiatedPayments.set(transactionRef, {
            phone: formattedPhone,
            amount: amount,
            timestamp: new Date(),
            status: "pending"
        });

        // Make STK Push request
        const response = await axios.post(
            `${baseUrl}/mpesa/stkpush/v1/processrequest`,
            stkPayload,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (response.data.ResponseCode === "0") {
            // Successfully initiated STK Push
            return res.json({
                success: true,
                message: "STK Push initiated successfully",
                checkoutRequestID: response.data.CheckoutRequestID,
                merchantRequestID: response.data.MerchantRequestID,
                transactionRef: transactionRef
            });
        } else {
            throw new Error(response.data.ResponseDescription || "Failed to initiate STK Push");
        }

    } catch (error) {
        console.error("Deposit error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to initiate deposit. Please try again.",
            error: error.message
        });
    }
});

//  CALLBACK URL
app.post("/api/callback", (req, res) => {
    try {
        const callbackData = req.body;

        // Extract transaction details from callback
        const stkCallback = callbackData.Body.stkCallback;

        if (!stkCallback) {
            return res.json({ ResultCode: 1, ResultDesc: "Invalid callback" });
        }

        const resultCode = stkCallback.ResultCode;
        const resultDesc = stkCallback.ResultDesc;
        const checkoutRequestID = stkCallback.CheckoutRequestID;

        if (resultCode === 0) {
            // Payment successful
            const callbackMetadata = stkCallback.CallbackMetadata;
            const metadataItems = callbackMetadata.Item;

            let amount = 0;
            let mpesaReceipt = "";
            let phone = "";
            let transactionDate = "";

            metadataItems.forEach(item => {
                if (item.Name === "Amount") amount = item.Value;
                if (item.Name === "MpesaReceiptNumber") mpesaReceipt = item.Value;
                if (item.Name === "PhoneNumber") phone = item.Value;
                if (item.Name === "TransactionDate") transactionDate = item.Value;
            });

            // Format date
            const formattedDate = moment(transactionDate, "YYYYMMDDHHmmss").format("YYYY-MM-DD HH:mm");

            // Add to transactions
            transactions.push({
                mpesaId: mpesaReceipt,
                phone: phone,
                amount: amount,
                datetime: formattedDate,
                walletId: "WLT-001",
                status: "completed"
            });

            console.log(`✅ Payment received: KES ${amount} from ${phone} (Receipt: ${mpesaReceipt})`);

            return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
        } else {
            // Payment failed
            console.log(`❌ Payment failed: ${resultDesc}`);
            return res.json({ ResultCode: 0, ResultDesc: "Failed payment noted" });
        }

    } catch (error) {
        console.error("Callback error:", error);
        return res.json({ ResultCode: 1, ResultDesc: "Error processing callback" });
    }
});

// SIMULATED CALLBACK FOR DEVELOPMENT
app.post("/api/simulate-callback", (req, res) => {
    const { phone, amount, status } = req.body;

    if (!phone || !amount || !status) {
        return res.status(400).json({ success: false, message: "Missing parameters" });
    }

    if (amount < 2) {
        return res.status(400).json({ success: false, message: "Amount must be at least KES 2" });
    }

    // Format phone
    let formattedPhone = phone.toString().trim();
    if (formattedPhone.startsWith("0")) {
        formattedPhone = "254" + formattedPhone.substring(1);
    }

    if (status === "success") {
        // Generate mock receipt
        const mpesaReceipt = "MP" + Date.now().toString().substring(5) + Math.floor(Math.random() * 1000);

        transactions.push({
            mpesaId: mpesaReceipt,
            phone: formattedPhone,
            amount: amount,
            datetime: moment().format("YYYY-MM-DD HH:mm"),
            walletId: "WLT-001",
            status: "completed",
            simulated: true
        });

        return res.json({
            success: true,
            message: "Payment simulated successfully",
            receipt: mpesaReceipt,
            amount: amount,
            phone: formattedPhone
        });
    } else {
        return res.json({
            success: false,
            message: "Payment simulation failed",
            amount: amount,
            phone: formattedPhone
        });
    }
});

//PAYMENT STATUS 
app.post("/api/check-payment", async (req, res) => {
    try {
        const { checkoutRequestID } = req.body;

        if (!checkoutRequestID) {
            return res.status(400).json({ success: false, message: "Checkout Request ID required" });
        }

        const accessToken = await getAccessToken();
        const timestamp = moment().format("YYYYMMDDHHmmss");
        const password = generatePassword(shortcode, passkey, timestamp);

        const payload = {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestID
        };

        const response = await axios.post(
            `${baseUrl}/mpesa/stkpushquery/v1/query`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (response.data.ResultCode === "0") {
            // Payment completed successfully
            return res.json({
                success: true,
                status: "completed",
                resultDesc: response.data.ResultDesc
            });
        } else {
            // Payment pending or failed
            return res.json({
                success: false,
                status: response.data.ResultCode === "1032" ? "cancelled" : "failed",
                resultDesc: response.data.ResultDesc
            });
        }

    } catch (error) {
        console.error("Check payment error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error checking payment status",
            error: error.message
        });
    }
});

// TRANSACTION HISTORY ENDPOINT -- FROMTEND
app.get("/api/transactions", (req, res) => {
    // Optional query parameters for filtering
    const { phone, startDate, endDate, limit } = req.query;

    let filteredTransactions = [...transactions];

    // Filter by phone 
    if (phone) {
        filteredTransactions = filteredTransactions.filter(tx =>
            tx.phone.includes(phone) || tx.phone.includes(phone.replace(/^0/, "254"))
        );
    }

    // Filter by date range
    if (startDate) {
        const start = moment(startDate);
        filteredTransactions = filteredTransactions.filter(tx =>
            moment(tx.datetime).isSameOrAfter(start)
        );
    }

    if (endDate) {
        const end = moment(endDate).endOf('day');
        filteredTransactions = filteredTransactions.filter(tx =>
            moment(tx.datetime).isSameOrBefore(end)
        );
    }

    // Sort by date NEWEST JUU
    filteredTransactions.sort((a, b) => moment(b.datetime) - moment(a.datetime));

    // Apply limit if provided
    if (limit) {
        filteredTransactions = filteredTransactions.slice(0, parseInt(limit));
    }

    // Calculate totals
    const today = moment().format("YYYY-MM-DD");
    const currentMonth = moment().format("YYYY-MM");

    const todayTotal = filteredTransactions
        .filter(tx => tx.datetime.startsWith(today))
        .reduce((sum, tx) => sum + tx.amount, 0);

    const monthTotal = filteredTransactions
        .filter(tx => tx.datetime.startsWith(currentMonth))
        .reduce((sum, tx) => sum + tx.amount, 0);

    const totalCount = filteredTransactions.length;
    const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    res.json({
        success: true,
        transactions: filteredTransactions,
        summary: {
            totalCount,
            totalAmount,
            todayTotal,
            monthTotal
        }
    });
});

// GETTING BALKLANCE YA WALLET
app.get("/api/wallet/balance", (req, res) => {
    const today = moment().format("YYYY-MM-DD");

    // BALLANCE YA WALLET  resets daily
    const todayBalance = transactions
        .filter(tx => tx.datetime.startsWith(today) && tx.status === "completed")
        .reduce((sum, tx) => sum + tx.amount, 0);

    res.json({
        success: true,
        balance: todayBalance,
        currency: "KES",
        lastUpdated: new Date().toISOString()
    });
});

// STARTING FRONTEND DEPOSIT ENDPOINTS AS PLANNED 
app.get("/api/initiate-deposit", (req, res) => {
    // This endpoint would render a frontend form for deposit
    // For API, we'll return deposit options
    res.json({
        success: true,
        options: {
            minAmount: 2,
            maxAmount: 70000,
            currency: "KES",
            instructions: "Enter amount between KES 2 and KES 70,000"
        }
    });
});

// HEALTH CHECK ENDPOINT
app.get("/api/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        transactionCount: transactions.length,
        services: {
            mpesa: "available",
            database: "in-memory"
        }
    });
});

//  TEST ENDPOINT 
app.post("/api/test-deposit", (req, res) => {
    const { phone, amount } = req.body;

    if (!phone || !amount) {
        return res.status(400).json({ success: false, message: "Phone and amount required" });
    }

    if (amount < 2) {
        return res.status(400).json({ success: false, message: "Minimum amount is KES 2" });
    }

    // test transaction
    const testTransaction = {
        mpesaId: "TEST" + Date.now(),
        phone: phone,
        amount: amount,
        datetime: moment().format("YYYY-MM-DD HH:mm"),
        walletId: "WLT-001",
        status: "completed",
        test: true
    };

    transactions.push(testTransaction);

    res.json({
        success: true,
        message: "Test deposit recorded successfully",
        transaction: testTransaction,
        currentBalance: transactions
            .filter(tx => tx.datetime.startsWith(moment().format("YYYY-MM-DD")) && tx.status === "completed")
            .reduce((sum, tx) => sum + tx.amount, 0)
    });
});

//  RESET TRANSACTIONS ---FOR TESTING 
app.post("/api/reset-transactions", (req, res) => {
    transactions = [];
    initiatedPayments.clear();
    res.json({
        success: true,
        message: "All transactions have been reset",
        transactionCount: 0
    });
});

//  GET STARTED PAYMENTS 
app.get("/api/initiated-payments", (req, res) => {
    const payments = Array.from(initiatedPayments.entries()).map(([ref, data]) => ({
        transactionRef: ref,
        ...data
    }));

    res.json({
        success: true,
        payments: payments,
        total: payments.length
    });
});

// THIS IS THE STATISTICS ENDPOINT 
app.get("/api/statistics", (req, res) => {
    const today = moment().format("YYYY-MM-DD");
    const yesterday = moment().subtract(1, 'day').format("YYYY-MM-DD");
    const currentMonth = moment().format("YYYY-MM");
    const lastMonth = moment().subtract(1, 'month').format("YYYY-MM");

    // Filter completed transactions
    const completedTransactions = transactions.filter(tx => tx.status === "completed");

    // Calculate statistics
    const stats = {
        daily: {
            today: completedTransactions
                .filter(tx => tx.datetime.startsWith(today))
                .reduce((sum, tx) => sum + tx.amount, 0),
            yesterday: completedTransactions
                .filter(tx => tx.datetime.startsWith(yesterday))
                .reduce((sum, tx) => sum + tx.amount, 0)
        },
        monthly: {
            current: completedTransactions
                .filter(tx => tx.datetime.startsWith(currentMonth))
                .reduce((sum, tx) => sum + tx.amount, 0),
            previous: completedTransactions
                .filter(tx => tx.datetime.startsWith(lastMonth))
                .reduce((sum, tx) => sum + tx.amount, 0)
        },
        totals: {
            transactionCount: completedTransactions.length,
            totalAmount: completedTransactions.reduce((sum, tx) => sum + tx.amount, 0),
            averageTransaction: completedTransactions.length > 0
                ? completedTransactions.reduce((sum, tx) => sum + tx.amount, 0) / completedTransactions.length
                : 0
        },
        recentActivity: completedTransactions
            .slice(0, 5)
            .map(tx => ({
                amount: tx.amount,
                phone: tx.phone,
                datetime: tx.datetime
            }))
    };

    res.json({
        success: true,
        statistics: stats,
        generatedAt: new Date().toISOString()
    });
});

// SERVER starts output logs 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 M-Pesa API endpoints available:`);
    console.log(`   POST /api/deposit        - Initiate deposit with custom amount`);
    console.log(`   GET  /api/transactions   - Get transaction history`);
    console.log(`   GET  /api/wallet/balance - Get current wallet balance`);
    console.log(`   POST /api/simulate-callback - Simulate payment callback`);
    console.log(`   POST /api/test-deposit   - Create test transaction`);
    console.log(`   GET  /api/statistics     - Get transaction statistics`);
    console.log(`   IMPORTANT: Update M-Pesa credentials in server.js`);
    console.log(`   - consumerKey, consumerSecret, passkey`);
    console.log(`   - CallBackURL in STK Push payload`);
});