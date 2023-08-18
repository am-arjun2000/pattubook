// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore, addDoc, collection,query,orderBy,getDocs } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

// Firebase configuration (replace with your values)
const firebaseConfig = {
    apiKey: "AIzaSyCThkEynWpvgY5klvM5GIiXZ-7m_PB4BNM",
    authDomain: "fir-test-e48ce.firebaseapp.com",
    projectId: "fir-test-e48ce",
    storageBucket: "fir-test-e48ce.appspot.com",
    messagingSenderId: "1085307460212",
    appId: "1:1085307460212:web:aa53479619c5a2ddf44f21"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



document.getElementById("myForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const topupInput = parseFloat(document.getElementById("topupInput").value || "0");
    const spentInput = parseFloat(document.getElementById("spentInput").value || "0");
    const descInput = document.getElementById("descInput").value;
    const timestamp = new Date().toLocaleString();

    if (topupInput === 0 && spentInput === 0) {
        alert("Either topup or spent should be a non-zero value.");
        return;
    }

    if (spentInput !== 0 && !descInput.trim()) {
        alert("Description is mandatory when entering a spent amount.");
        return;
    }

    if (!confirm("Are you sure you want to submit this record?")) {
        return;
    }

    let currentBalance = await getCurrentBalance();
    currentBalance += topupInput - spentInput;

    try {
        await addDoc(collection(db, "users"), {
            topup: topupInput.toFixed(2),
            spent: spentInput.toFixed(2),
            description: descInput || "top up",
            timestamp: timestamp,
            balance: currentBalance.toFixed(2)
        });

        fetchLog();
    } catch (error) {
        console.error("Error adding document: ", error);
    }
});

document.getElementById("topupInput").addEventListener("input", function() {
    if (this.value) {
        document.getElementById("spentInput").disabled = true;
        document.getElementById("descInput").value = "top up";
        document.getElementById("descInput").disabled = true;
    } else {
        document.getElementById("spentInput").disabled = false;
        document.getElementById("descInput").value = "";
        document.getElementById("descInput").disabled = false;
    }
});

document.getElementById("spentInput").addEventListener("input", function() {
    if (this.value) {
        document.getElementById("topupInput").disabled = true;
    } else {
        document.getElementById("topupInput").disabled = false;
    }
});

async function fetchLog() {
    const orderedQuery = query(collection(db, "users"), orderBy("timestamp", "asc")); // Order by timestamp
    const querySnapshot = await getDocs(orderedQuery);
    let logContent = "<table><thead><tr><th>Topup</th><th>Spent</th><th>Timestamp</th><th>Description</th><th>Balance</th></tr></thead><tbody>";
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        logContent += `<tr><td>${data.topup}</td><td>${data.spent}</td><td>${data.timestamp}</td><td>${data.description}</td><td>${data.balance}</td></tr>`;
    });

    logContent += "</tbody></table>";
    document.getElementById("log").innerHTML = logContent;
    
    const currentBalance = await getCurrentBalance();
    document.getElementById("balance").textContent = currentBalance.toFixed(2);
}

async function getCurrentBalance() {
    const querySnapshot = await getDocs(collection(db, "users"));
    let balance = 0;

    querySnapshot.forEach((doc) => {
        balance += parseFloat(doc.data().topup) - parseFloat(doc.data().spent);
    });

    return balance;
}

fetchLog();


