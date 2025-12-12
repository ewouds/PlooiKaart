import { Link } from "react-router-dom";

export default function Reglement() {
  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <Link to='/'>&larr; Back to Dashboard</Link>
      
      <h1 style={{ marginTop: "1rem" }}>REGLEMENT DER PLOOIKAARTEN</h1>
      <p><em>Goedgekeurd bij meerderheid der aanwezige heerschappen</em></p>
      <p>Zoals geweten zal vanaf 1/1/2026 het plooikaarten systeem in voegen gaan, hierbij de regels die vastgelegd en goedgekeurd zijn:</p>

      <section style={{ marginTop: "2rem" }}>
        <h2>Artikel 1: Jaarlijkse toekenning</h2>
        <p>1.1. Iedere deelnemer verkrijgt, krachtens dit reglement, vijf (5) plooikaarten per kalenderjaar.</p>
        <p>1.2. Het kalenderjaar vangt formeel aan op 1 januari.</p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Artikel 2: Beroepsmatige luchtvaarders</h2>
        <p>2.1. De heer die beroepshalve een luchtvaartuig bestuurt, geniet wegens bewezen stress- en turbulentiegevoeligheid een uitzonderingsstatuut.</p>
        <p>2.2. Onderhavig statuut verleent hem tien (10) plooikaarten bij aanvang van elk kalenderjaar.</p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Artikel 3: Voorwaarden tot het werpen der plooikaart</h2>
        <p>3.1. Een plooikaart wordt geacht rechtsgeldig “gesmeten” zodra een quorum van twee (2) heren is bereikt.</p>
        <p>3.2. Dit quorum wordt gevormd wanneer minstens twee leden een afspraak op de traditionele donderdagvergadering bevestigen.</p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Artikel 4: Bijkoop der plooikaarten</h2>
        <p>4.1. Hij die zijn plooikaarten heeft opgesoupeerd, kan nieuwe verwerven via het mechanisme der bijkoop.</p>
        <p>4.2. Bijkopen geschiedt uitsluitend in pakketten van vijf (5) kaarten.</p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Artikel 5: Kostprijs van de bijkoop</h2>
        <p>5.1. De eerste bijkoop wordt geacht rechtsgeldig voltooid wanneer de koper een rondje verstrekt en zich hoffelijk vergewist van de dorstbehoeften der op donderdag aanwezige heren.</p>
        <p>5.2. Bij iedere daaropvolgende bijkoop wordt de verschuldigde tegenprestatie verhoogd tot het aanleveren van passende versnaperingen, ter ondersteuning van het genot der drank.</p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Artikel 6: Gerechtvaardigde afwezigheid</h2>
        <p>6.1. Een afwezigheid wordt uitsluitend als gerechtvaardigd erkend indien de heer in kwestie een geldig doktersattest kan voorleggen.</p>
        <p>6.2. Indien een heer op de vaste donderdagvergadering niet fysiek aanwezig is om 22:00 uur, wordt hij automatisch en onherroepelijk als “geplooid” beschouwd, behoudens het in Artikel 6.1 vermelde doktersattest.</p>
        <p>6.3. Een niet-gerechtvaardigde afwezigheid leidt onvermijdelijk tot verlies van een plooikaart, conform Artikel 3.3.</p>
      </section>
    </div>
  );
}
