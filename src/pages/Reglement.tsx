import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GavelIcon from "@mui/icons-material/Gavel";
import { Box, Button, Card, CardContent, Container, Divider, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function Reglement() {
  return (
    <Container maxWidth='md' sx={{ mt: 2, pb: 4 }}>
      <Button component={RouterLink} to='/' startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        terug
      </Button>

      <Card variant='outlined'>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <GavelIcon color='primary' fontSize='large' />
            <Box>
              <Typography variant='h4' component='h1'>
                REGLEMENT DER PLOOIKAARTEN
              </Typography>
              <Typography variant='subtitle1' color='text.secondary' sx={{ fontStyle: "italic" }}>
                Goedgekeurd bij meerderheid der aanwezige heerschappen
              </Typography>
            </Box>
          </Box>

          <Typography paragraph>
            Zoals geweten zal vanaf 1/1/2026 het plooikaarten systeem in voegen gaan, hierbij de regels die vastgelegd en goedgekeurd zijn:
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' gutterBottom color='primary'>
              Artikel 1: Jaarlijkse toekenning
            </Typography>
            <Typography paragraph>1.1. Iedere deelnemer verkrijgt, krachtens dit reglement, vijf (5) plooikaarten per kalenderjaar.</Typography>
            <Typography paragraph>1.2. Het kalenderjaar vangt formeel aan op 1 januari.</Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' gutterBottom color='primary'>
              Artikel 2: Beroepsmatige luchtvaarders
            </Typography>
            <Typography paragraph>
              2.1. De heer die beroepshalve een luchtvaartuig bestuurt, geniet wegens bewezen stress- en turbulentiegevoeligheid een
              uitzonderingsstatuut.
            </Typography>
            <Typography paragraph>2.2. Onderhavig statuut verleent hem tien (10) plooikaarten bij aanvang van elk kalenderjaar.</Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' gutterBottom color='primary'>
              Artikel 3: Voorwaarden tot het werpen der plooikaart
            </Typography>
            <Typography paragraph>
              3.1. Een plooikaart wordt geacht rechtsgeldig “gesmeten” zodra een quorum van twee (2) heren is bereikt.
            </Typography>
            <Typography paragraph>
              3.2. Dit quorum wordt gevormd wanneer minstens twee leden een afspraak op de traditionele samenkomst present tekenen op de afgesproken
              locatie.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' gutterBottom color='primary'>
              Artikel 4: Bijkoop der plooikaarten
            </Typography>
            <Typography paragraph>4.1. Hij die zijn plooikaarten heeft opgesoupeerd, kan nieuwe verwerven via het mechanisme der bijkoop.</Typography>
            <Typography paragraph>4.2. Bijkopen geschiedt uitsluitend in pakketten van vijf (5) kaarten.</Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' gutterBottom color='primary'>
              Artikel 5: Kostprijs van de bijkoop
            </Typography>
            <Typography paragraph>
              5.1. De eerste bijkoop wordt geacht rechtsgeldig voltooid wanneer de koper een rondje verstrekt en zich hoffelijk vergewist van de
              dorstbehoeften der aanwezige heren.
            </Typography>
            <Typography paragraph>
              5.2. Bij iedere daaropvolgende bijkoop wordt de verschuldigde tegenprestatie verhoogd tot het aanleveren van passende versnaperingen,
              ter ondersteuning van het genot der drank.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' gutterBottom color='primary'>
              Artikel 6: Gerechtvaardigde afwezigheid
            </Typography>
            <Typography paragraph>
              6.1. Een afwezigheid wordt uitsluitend als gerechtvaardigd erkend indien de heer in kwestie een geldig doktersattest kan voorleggen.
            </Typography>
            <Typography paragraph>
              6.2. Indien een heer op de vaste samenkomst niet fysiek en lijfelijk aanwezig is om 22:00 uur, zijnde Midden-Europese Tijd (CET/CEST),
              zoals van toepassing op het Belgisch grondgebied, wordt hij van rechtswege, automatisch en onherroepelijk als “geplooid” beschouwd,
              behoudens het in Artikel 6.1 vermelde geldige doktersattest.
            </Typography>
            <Typography paragraph>
              6.3. Een niet-gerechtvaardigde afwezigheid leidt onvermijdelijk tot verlies van een plooikaart, conform Artikel 3.3.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant='h6' gutterBottom color='primary'>
              Artikel 7: Genderneutrale interpretatie
            </Typography>
            <Typography paragraph>
              7.1. Waar in dit reglement gebruik wordt gemaakt van de termen “de heer”, “heren” of aanverwante mannelijk grammaticale constructies,
              dienen deze uitsluitend te worden begrepen als stilistische, historisch-culturele en taalkundige conventies, zonder enige intentie tot
              uitsluiting.
            </Typography>
            <Typography paragraph>
              7.2. Deze termen worden, zonder uitzondering, geacht te verwijzen naar ieder lid, deelnemer of aanwezig wezen, ongeacht
              genderidentiteit, -expressie, -beleving of enige andere persoonskenmerk dat juridisch of maatschappelijk relevant zou kunnen zijn.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant='h6' gutterBottom color='primary'>
              Artikel 8: Statutaire Wijzigingen
            </Typography>
            <Typography paragraph>
              8.1. Met ingang van 1 januari 2026 zijn wijzigingen aan deze statuten slechts mogelijk na uitdrukkelijke ratificatie door een
              gekwalificeerde meerderheid van vier vijfde (4/5) der stemgerechtigde leden.
            </Typography>
            <Typography paragraph>
              8.2. De stemming kan zowel in fysieke aanwezigheid als via digitale weg geschieden, mits de authenticiteit van de stem onomstotelijk
              vaststaat.
            </Typography>
            <Typography paragraph>
              8.3. Een statutaire wijziging treedt pas in werking op het moment van officiële publicatie in de Plooikaart-applicatie, dewelke fungeert
              als de enige en absolute bron van waarheid (<i>single source of truth</i>).
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
