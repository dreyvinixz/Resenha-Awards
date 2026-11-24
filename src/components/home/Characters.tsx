import { characterCopy } from '../../data/homeContent';

export function Characters() {
  return (
    <section className="characters section" id="personagens">
      <div className="section-marker">
        <span>
          {"02 / ELENCO"}
        </span>
        <span>
          {"ARQUIVOS DE PERSONAGENS"}
        </span>
      </div>
      <div className="section-heading centered">
        <span className="kicker">
          {characterCopy.kicker}
        </span>
        <h2>
          {"PERSONAGENS"}
        </h2>
        <p>
          {characterCopy.description}
        </p>
      </div>
      <div className="character-scroll">
        <div className="character-panel">
          <div className="character-stage">
            <div className="character-info">
              <span className="serial">
                {"ARQUIVO "}
                <span id="character-number">
                  {"01"}
                </span>
                {" / 09"}
              </span>
              <h3 id="character-name">
                {"ANDREY"}
              </h3>
              <div className="yellow-rule">
              </div>
              <p>
                {"Uma das figuras que dão vida ao universo Resenha Awards. Cada personagem tem sua própria história — e a resenha está só começando."}
              </p>
              <button className="outline-button" id="open-sheet">
                {"VER FICHA "}
                <span>
                  {/* @license lucide-static v1.78.0 - ISC */}
                  <svg className="ui-icon lucide lucide-arrow-up-right" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 7h10v10" />
                    <path d="M7 17 17 7" />
                  </svg>
                </span>
              </button>
            </div>
            <div className="character-art">
              <span className="art-label">
                {"Tropa da Baguga"}
              </span>
              <img id="character-image" alt="Personagem Andrey" />
              <span className="art-index" id="art-index">
                {"01"}
              </span>
            </div>
            <div className="character-controls">
              <button id="prev-character" aria-label="Personagem anterior">
                {/* @license lucide-static v1.78.0 - ISC */}
                <svg className="ui-icon lucide lucide-arrow-left" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
              </button>
              <span>
                <b id="current-index">
                  {"01"}
                </b>
                {" / 09"}
              </span>
              <button id="next-character" aria-label="Próximo personagem">
                {/* @license lucide-static v1.78.0 - ISC */}
                <svg className="ui-icon lucide lucide-arrow-right" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="character-tabs" id="character-tabs" aria-label="Escolher personagem">
          </div>
          <p className="character-scroll-hint">
            {"ROLE PARA CONHECER O ELENCO "}
            <svg className="scroll-hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 4v16" />
              <path d="m5 13 7 7 7-7" />
            </svg>
          </p>
        </div>
      </div>
    </section>
  );
}
