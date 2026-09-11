const url = "https://script.google.com/macros/s/AKfycbwQJWQ2hKXQMdnFqVYr8Tan_9BIKQLtZyM_Wil6y19mRrgiQhEb1KB0hwOvJsPThcIX/exec";
fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "verifyPassword", password: "123" })
})
.then(res => res.text())
.then(text => console.log(text))
.catch(err => console.error(err));
