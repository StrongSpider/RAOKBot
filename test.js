app.post("/prompt-purchase", async function (req, res) {
	if (!await CheckRateLimit(req, res)) return;
	if (req.headers.authorization !== BearerToken) {
		res.status(401).send("Invalid Credentials")
		return
	}

	CheckForUserId(req.body.UserId).then(() => {
		res.json({ "message": "ok" })
	}).catch((err) => {
		res.json({ "error": err.message })
	})
})

app.post("/validate-purchase", async function (req, res) {
	if (!await CheckRateLimit(req, res)) return;
	if (req.headers.authorization !== BearerToken) {
		res.status(401).send("Invalid Credentials")
		return
	}

	UserPurchasedItem(req.body.UserId).then(() => {
		res.json({ "message": "ok" })
	}).catch((err) => {
		res.json({ "error": err.message })
	})
})