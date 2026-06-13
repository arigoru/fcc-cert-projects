var helmet = require("helmet");

module.exports = function(app, next=()=>{}) {
  app.use(
    "/",
    helmet({
      hidePoweredBy: { setTo: "PHP 3.2.1" },
      frameguard: { action: "deny" },
      dnsPrefetchControl: true,
      referrerPolicy: {policy: 'same-origin'},
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "code.jquery.com"],
          imgSrc: ["cdn.gomix.com"]
        }
      }
    })
  );
  next();
};
