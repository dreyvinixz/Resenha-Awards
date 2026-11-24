import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles.css';

function VotingClosed() {
  return <div className="nomination-page"><header className="form-header"><a href="/" className="form-brand"><img src="/assets/Logo%20Neon%20RESENHA%20AWARDS.png" alt="Resenha Awards"/></a><a href="/" className="form-back">VOLTAR AO SITE</a></header><main className="ballot-layout"><div className="ballot-intro"><span className="form-overline">EDIÇÃO 2026 // VOTAÇÃO</span><h1>AINDA<br/><em>NÃO ABRIU.</em></h1><div className="form-intro-rule"/><p>A votação começa depois que a galera enviar suas indicações e a organização definir os concorrentes.</p></div><section className="nomination-form ballot-form"><div className="form-top"><span>// EM BREVE</span><span>RESENHA AWARDS 2026</span></div><h2>POR ENQUANTO<span>.</span></h2><p className="form-description">A etapa de indicações está acontecendo primeiro. Conta pra gente quem e o que merece entrar na disputa.</p><a className="form-submit" href="/indicacoes/">FAZER INDICAÇÕES</a></section></main><footer className="form-footer"><span>RESENHA AWARDS // 2026</span><span>UMA NOITE. MUITAS HISTÓRIAS.</span></footer></div>;
}
createRoot(document.getElementById('form-root')).render(<VotingClosed/>);
