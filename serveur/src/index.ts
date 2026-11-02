// Quizzle 1.3 : API (Cloudflare Worker).
// Premiere version : seulement une route de sante, pour verifier le deploiement.

const ENTETES = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

function json(donnees: unknown, status = 200): Response {
  return new Response(JSON.stringify(donnees), { status, headers: ENTETES });
}

// Jour courant au fuseau Europe/Paris (AAAA-MM-JJ) : c'est le serveur qui decide du jour.
function jourParis(): string {
  return new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export default {
  async fetch(requete: Request): Promise<Response> {
    const { pathname } = new URL(requete.url);

    if (requete.method === 'GET' && pathname === '/v1/sante') {
      return json({ ok: true, service: 'quizzle-api', jour: jourParis() });
    }

    return json({ erreur: 'introuvable' }, 404);
  },
};
