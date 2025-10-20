// ---------------- Users ----------------
function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || {};
}

// ---------------- Sign Up ----------------
function signup() {
    let username = document.getElementById("signup-username").value.trim();
    let password = document.getElementById("signup-password").value.trim();
    let users = getUsers();

    if(!username || !password){
        document.getElementById("signup-msg").innerText = "Enter username and password!";
        return;
    }

    if(users[username]){
        document.getElementById("signup-msg").innerText = "Username already exists!";
        return;
    }

    users[username] = {password: password, transactions: []};
    localStorage.setItem("users", JSON.stringify(users));
    document.getElementById("signup-msg").style.color = "green";
    document.getElementById("signup-msg").innerText = "Sign up successful! You can login now.";
}

// ---------------- Show Pages ----------------
function showLogin() {
    document.getElementById("signup-container").style.display = "none";
    document.getElementById("login-container").style.display = "block";
}

function showSignup() {
    document.getElementById("signup-container").style.display = "block";
    document.getElementById("login-container").style.display = "none";
}

// ---------------- Login ----------------
let currentUser = null;
function login() {
    let username = document.getElementById("login-username").value.trim();
    let password = document.getElementById("login-password").value.trim();
    let users = getUsers();

    if(users[username] && users[username].password === password){
        currentUser = username;
        document.getElementById("login-container").style.display = "none";
        document.getElementById("signup-container").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        document.getElementById("user-display").innerText = username;
        updateTable();
        updateSummary();
        updateChart();
    } else {
        document.getElementById("login-msg").innerText = "Invalid username or password!";
    }
}

// ---------------- Logout ----------------
function logout() {
    currentUser = null;
    document.getElementById("dashboard").style.display = "none";
    showLogin();
}

// ---------------- Transactions ----------------
function addTransaction(){
    let date = document.getElementById("date").value;
    let category = document.getElementById("category").value;
    let type = document.getElementById("type").value;
    let amount = parseFloat(document.getElementById("amount").value);

    if(!date || !amount){ alert("Enter valid date and amount."); return; }

    let users = getUsers();
    users[currentUser].transactions.push({date, category, type, amount});
    localStorage.setItem("users", JSON.stringify(users));

    updateTable();
    updateSummary();
    updateChart();
}

// ---------------- Update Table ----------------
function updateTable(){
    let users = getUsers();
    let transactions = users[currentUser].transactions;
    let table = document.getElementById("trans-table");
    table.innerHTML = `<tr>
        <th>Date</th><th>Category</th><th>Type</th><th>Amount</th><th>Action</th>
    </tr>`;

    transactions.forEach((t,i)=>{
        let row = table.insertRow();
        row.insertCell(0).innerText = t.date;
        row.insertCell(1).innerText = t.category;
        row.insertCell(2).innerText = t.type;
        row.insertCell(3).innerText = t.amount;
        let delBtn = document.createElement("button");
        delBtn.innerText = "Delete";
        delBtn.onclick = ()=>deleteTransaction(i);
        row.insertCell(4).appendChild(delBtn);
    });
}

// ---------------- Delete Transaction ----------------
function deleteTransaction(index){
    let users = getUsers();
    users[currentUser].transactions.splice(index,1);
    localStorage.setItem("users", JSON.stringify(users));
    updateTable();
    updateSummary();
    updateChart();
}

// ---------------- Summary ----------------
function updateSummary(){
    let users = getUsers();
    let transactions = users[currentUser].transactions;
    let income = transactions.filter(t=>t.type==="Income").reduce((a,b)=>a+b.amount,0);
    let expense = transactions.filter(t=>t.type==="Expense").reduce((a,b)=>a+b.amount,0);
    document.getElementById("total-income").innerText = income;
    document.getElementById("total-expense").innerText = expense;
    document.getElementById("net-balance").innerText = income - expense;
}

// ---------------- Chart ----------------
function updateChart(){
    let users = getUsers();
    let transactions = users[currentUser].transactions;
    let expenseData = {};
    transactions.filter(t=>t.type==="Expense").forEach(t=>{
        expenseData[t.category] = (expenseData[t.category]||0)+t.amount;
    });

    let ctx = document.getElementById('expenseChart').getContext('2d');
    if(window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx,{
        type:'pie',
        data:{
            labels: Object.keys(expenseData),
            datasets:[{data:Object.values(expenseData), backgroundColor:['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF']}]
        }
    });
}