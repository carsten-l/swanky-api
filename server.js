const jsonServer = require("json-server-relationship");
const auth = require("json-server-auth");

const app = jsonServer.create();
const router = jsonServer.router("db.json");

const port = process.env.PORT || 4000;

// /!\ Bind the router db to the app
app.db = router.db;

// Make sure to use the default middleware
const middlewares = jsonServer.defaults();

app.use(middlewares);
app.use(jsonServer.bodyParser);

// Custom route to fetch a post by slug or numeric id
app.get("/posts/:identifier", (req, res) => {
  const { identifier } = req.params;
  const parsedId = Number(identifier);
  const isNumericId =
    Number.isInteger(parsedId) && identifier === parsedId.toString();

  const match = isNumericId ? { id: parsedId } : { slug: identifier };

  const post = router.db.get("posts").find(match).value();

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  res.json(post);
});

const rules = auth.rewriter({
  // Permission rules
  users: 600,
  secrets: 660,
});

// You must apply the auth middleware before the router
app.use(rules);
app.use(auth);
app.use(router);
app.listen(port, () => {
  console.log("Server is ready for requests on port " + port);
});

module.exports = app;
