var helmet = require("helmet");

module.exports = function(app, next=()=>{}) {
  app.use(
    "/",
    helmet({
      hidePoweredBy: { setTo: "PHP 4.2.0" },
      frameguard: { action: "deny" },
      noCache: true,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", "https://cdn.gomix.com/", "code.jquery.com"],
          scriptSrc: ["'self'", "code.jquery.com"],
          styleSrc: ["'self'","'unsafe-inline'"]
        }
      }
    })
  );
  next();
};
