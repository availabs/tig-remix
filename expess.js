const express = require("express");
const path = require("path");

const {
  createRequestHandler,
} = require("@remix-run/express");

const app = express();
const BUILD_DIR = path.join(process.cwd(), "public/build");

// needs to handle all verbs (GET, POST, etc.)
app.all(
  "*",
  createRequestHandler({
    // `remix build` and `remix dev` output files to a build directory, you need
    // to pass that build to the request handler
    build: require(BUILD_DIR),

    // return anything you want here to be available as `context` in your
    // loaders and actions. This is where you can bridge the gap between Remix
    // and your server
    getLoadContext(req, res) {
      return {};
    },
  })
);