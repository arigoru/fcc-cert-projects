var helmet = require("helmet");

module.exports = function(app, next=()=>{}) {
  app.use(
    "/",
    helmet({
      hidePoweredBy: { setTo: "PHP 3.2.1" },
      frameguard: { action: "deny" },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"]
        }
      }
    })
  );
  next();
};
