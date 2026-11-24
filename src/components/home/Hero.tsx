export function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-bg">
      </div>
      <div className="hero-shade">
      </div>
      <div className="hero-content">
        <div className="hero-actions">
          <a className="hero-action" href="#categorias">
            {"CATEGORIAS "}
            <span>
              {/* @license lucide-static v1.78.0 - ISC */}
              <svg className="ui-icon lucide lucide-arrow-up-right" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10v10" />
                <path d="M7 17 17 7" />
              </svg>
            </span>
          </a>
          <a className="hero-action" href="#personagens">
            {"CONHEÇA A GALERA "}
            <span>
              {/* @license lucide-static v1.78.0 - ISC */}
              <svg className="ui-icon lucide lucide-arrow-up-right" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10v10" />
                <path d="M7 17 17 7" />
              </svg>
            </span>
          </a>
        </div>
      </div>
      <a className="hero-scroll" href="#personagens" aria-label="Rolar para conhecer os personagens">
        {/* @license lucide-static v1.78.0 - ISC */}
        <svg className="ui-icon lucide lucide-arrow-down" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </svg>
      </a>
    </section>
  );
}
