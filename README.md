# Lokaverkefni - Tix API

## Verkefnalýsing

Búðu til RESTful API fyrir miðasölukerfið svipað og Tix. Kerfið gerir notendum kleift að skoða viðburði, staði og kaupa miða. Notaðu þær venjur sem þú hefur lært í áfanganum.

## Tækni

- **Backend Framework**: Express.js með TypeScript
- **Gagnagrunnur**: PostgreSQL
- **Prófanir**: Vitest + Supertest

## Nauðsynlegir eiginleikar

API-ið þitt verður að styðja eftirfarandi grunneiningar:

- Notendur (með auðkenningu)
- Viðburðir (tónleikar, íþróttir, leikhús, o.s.frv.)
- Staðir
- Miðar
- Bókanir/Kaup
- Flokkar

## Notkunartilvik (Use Cases)

### UC1: Skoða viðburði

**Leikari**: Gestur (Óauðkenndur notandi)  
**Forsendur**: Engar  
**Aðalflæði**:

1. Notandi biður um lista yfir viðburði
2. Kerfið birtir alla væntanlega viðburði
3. Notandi beitir síum (flokkur, dagsetningabil, borg, staður)
4. Kerfið skilar síuðum niðurstöðum
5. Notandi raðar niðurstöðum (eftir dagsetningu, verði eða vinsældum)
6. Kerfið birtir raðaða viðburði

**Eftirskilyrði**: Notandi sér lista yfir viðburði sem passa við skilyrði  
**Önnur flæði**:

- 2a. Engir viðburðir fundust: Kerfið skilar tómum lista með viðeigandi skilaboðum

---
==============================================================================================================
#                                                 UC1 ALL DONE
==============================================================================================================

### UC2: Skoða upplýsingar um viðburð

**Leikari**: Gestur  
**Forsendur**: Viðburður er til í kerfinu  
**Aðalflæði**:

1. Notandi velur viðburð
2. Kerfið birtir upplýsingar um viðburð (nafn, lýsing, dagsetning, tími, staður, flokkur)
3. Kerfið sýnir tiltæka miða og verðlagningu

**Eftirskilyrði**: Notandi sér allar upplýsingar um viðburð  
**Önnur flæði**:

- 1a. Viðburður fannst ekki: Kerfið skilar 404 villu

---
==============================================================================================================
#                                                 UC2 ALL DONE
==============================================================================================================

### UC3: Skoða upplýsingar um stað

**Leikari**: Gestur  
**Forsendur**: Engar  
**Aðalflæði**:

1. Notandi biður um upplýsingar um stað
2. Kerfið birtir upplýsingar um stað (nafn, heimilisfang, rýmd)
3. Notandi skoðar væntanlega viðburði á staðnum
4. Kerfið birtir viðburði sem eru áætlaðir á þeim stað

**Eftirskilyrði**: Notandi sér upplýsingar um stað og tengda viðburði

---
==============================================================================================================
#                                                 UC3 ALL DONE
==============================================================================================================
### UC4: Skrá notanda

**Leikari**: Gestur  
**Forsendur**: Notandi er ekki með reikning  
**Aðalflæði**:

1. Notandi gefur upp skráningarupplýsingar (nafn, netfang, lykilorð)
2. Kerfið staðfestir innsláttargögn
3. Kerfið athugar að netfang sé ekki þegar skráð
4. Kerfið býr til nýjan notendareikning með hössuðu lykilorði
5. Kerfið skilar staðfestingu á árangri

**Eftirskilyrði**: Nýr notandareikningur búinn til  
**Önnur flæði**:

- 2a. Ógild gögn: Kerfið skilar villum við staðfestingu
- 3a. Netfang er þegar til: Kerfið skilar villuskilaboðum

---
==============================================================================================================
#                                                 UC4 ALL DONE
==============================================================================================================
### UC5: Innskráning

**Leikari**: Gestur  
**Forsendur**: Notandi er með skráðan reikning  
**Aðalflæði**:

1. Notandi gefur upp auðkenni (netfang, lykilorð)
2. Kerfið staðfestir auðkenni
3. Kerfið býr til auðkenningarmerki (token)
4. Kerfið skilar merki til notanda

**Eftirskilyrði**: Notandi er auðkenndur  
**Önnur flæði**:

- 2a. Ógild auðkenni: Kerfið skilar auðkenningarvillu

---
==============================================================================================================
#                                                 UC5 ALL DONE
==============================================================================================================

### UC6: Kaupa miða

**Leikari**: Auðkenndur notandi  
**Forsendur**: Notandi er innskráður, viðburður er með tiltæka miða  
**Aðalflæði**:

1. Notandi velur viðburð og æskilega miða
2. Kerfið staðfestir að miðar séu tiltækir
3. Notandi gefur upp greiðsluupplýsingar
4. Kerfið býr til bókun
5. Kerfið minnkar fjölda tiltækra miða
6. Kerfið skilar staðfestingu á bókun með einkvæmu auðkenni

**Eftirskilyrði**: Bókun búin til, miðar teknir frá  
**Önnur flæði**:

- 2a. Ekki nægir miðar: Kerfið skilar villu
- 2b. Dagsetning viðburðar er liðin: Kerfið skilar villu
- 4a. Greiðsla mistókst: Kerfið skilar villu, engin bókun búin til

---
==============================================================================================================
#                                                 Bíða eftir svari frá kennara
==============================================================================================================

### UC7: Skoða bókunarsögu

**Leikari**: Auðkenndur notandi  
**Forsendur**: Notandi er innskráður  
**Aðalflæði**:

1. Notandi biður um sínar bókanir
2. Kerfið sækir allar bókanir notanda
3. Kerfið birtir lista yfir bókanir með upplýsingum (viðburður, dagsetning, miðar, verð)

**Eftirskilyrði**: Notandi sér bókunarsögu sína  
**Önnur flæði**:

- 2a. Engar bókanir fundust: Kerfið skilar tómum lista

---
==============================================================================================================
#                                                 UC7 ALL DONE
==============================================================================================================

### UC8: Hætta við bókun

**Leikari**: Auðkenndur notandi  
**Forsendur**: Notandi er innskráður, bókun er til, viðburður er meira en 24 klukkustundum í burtu  
**Aðalflæði**:

1. Notandi velur bókun til að hætta við
2. Kerfið staðfestir að bókun tilheyri notanda
3. Kerfið athugar að afpöntun sé leyfð (>24 klukkustundir fyrir viðburð)
4. Kerfið hættir við bókun
5. Kerfið skilar miðum í tiltækan hóp
6. Kerfið vinnur endurgreiðslu
7. Kerfið staðfestir afpöntun

**Eftirskilyrði**: Bókun afpöntuð, miðar tiltækir aftur  
**Önnur flæði**:

- 2a. Bókun fannst ekki: Kerfið skilar 404 villu
- 2b. Bókun tilheyrir öðrum notanda: Kerfið skilar 403 villu
- 3a. Minna en 24 klukkustundir fyrir viðburð: Kerfið skilar villu, afpöntun ekki leyfð

---
==============================================================================================================
#                                                 UC8 ALL DONE
==============================================================================================================

### UC9: Uppfæra prófíl

**Leikari**: Auðkenndur notandi  
**Forsendur**: Notandi er innskráður  
**Aðalflæði**:

1. Notandi biður um uppfærslu á prófíl
2. Notandi gefur upp uppfærðar upplýsingar
3. Kerfið staðfestir ný gögn
4. Kerfið uppfærir notendaprófíl
5. Kerfið skilar uppfærðum prófíl

**Eftirskilyrði**: Notendaprófíll uppfærður  
**Önnur flæði**:

- 3a. Ógild gögn: Kerfið skilar villum við staðfestingu
- 3b. Netfang er þegar í notkun: Kerfið skilar villu

---
==============================================================================================================
#                                                 UC9 ALL DONE
==============================================================================================================

### UC10: Eyða reikningi

**Leikari**: Auðkenndur notandi  
**Forsendur**: Notandi er innskráður  
**Aðalflæði**:

1. Notandi biður um að eyða reikningi
2. Kerfið staðfestir auðkenni notanda
3. Kerfið hættir við allar framtíðarbókanir
4. Kerfið eyðir notendareikningi
5. Kerfið staðfestir eyðingu

**Eftirskilyrði**: Notendareikningur fjarlægður úr kerfinu
==============================================================================================================
#                                                 UC10 ALL DONE
==============================================================================================================

## Logik

1. **Framboð miða**

   - Ekki er hægt að bóka fleiri miða en eru tiltækir
   - Afpantaðar bókanir skila miðum í tiltækan hóp
==============================================================================================================
#                                                    TRUE
==============================================================================================================

2. **Afpöntun bókunar**

   - Aðeins er hægt að afpanta bókanir allt að 24 klukkustundum fyrir viðburð
==============================================================================================================
#                                                    TRUE
==============================================================================================================

3. **Dagsetningar viðburða**

   - Ekki er hægt að bóka miða á liðna viðburði
==============================================================================================================
#                                                    TRUE
==============================================================================================================

4. **Auðkenning notenda**

   - Lykilorð verða að vera geymd á öruggan hátt
   - Auðkenning er nauðsynleg fyrir öruggar aðgerðir
==============================================================================================================
#                                                    TRUE
==============================================================================================================

5. **Staðfesting gagna**
   - Gögn frá notanda þurfa að vera á réttu og staðfestu formi
   - Viðeigandi villuskilaboð fyrir ógild gögn
==============================================================================================================
#                                                    TRUE
==============================================================================================================

## Kröfur

### API hönnun

- RESTful endapunktar sem fylgja bestu venjum
- Viðeigandi HTTP aðferðir og stöðukóðar
- Skýr snið fyrir beiðnir og svör
- Rétt villumeðhöndlun

### Gagnagrunnur

- Vel hannað skema með viðeigandi tengslum
- Gagnaöryggi og takmarkanir
- Skilvirkar fyrirspurnir

### Öryggi

- Örugg geymsla lykilorða
- Öruggar leiðir sem krefjast auðkenningar
- Staðfesting og hreinsun inntaks (Input validation and sanitization)

### Prófanir

Prófarnir þínir eiga að ná utan um um öll notkunartilvik og jaðartilvik.

#### Hvað á að prófa

**Fyrir hvert notkunartilvik**:

- Prófa aðalflæðið (happy path)
- Prófa öll önnur flæði (villutilvik)
- Staðfesta rétta HTTP stöðukóða
- Staðfesta uppbyggingu og innihald svargagna
- Prófa staðfestingu inntaks

**Auðkenning og heimild**:

- Prófa öruggar leiðir án token (ætti að skila 401)
- Prófa öruggar leiðir með ógilt token (ætti að skila 401)
- Prófa öruggar leiðir með gilt token (ætti að virka)
- Prófa að sækja gögn annarra notenda (ætti að skila 403)
- Prófa lykilorðahössun (lykilorð eiga aldrei að vera geymd í textaformi)

**Viðskiptalögík**:

- Prófa skorður á framboði miða
- Prófa tímatakmörk fyrir afpöntun bókunar
- Prófa að afpantaðar bókanir skili miðum í hópinn
- Prófa að koma í veg fyrir bókanir á liðna viðburði
- Prófa að koma í veg fyrir tvítekið netfang við skráningu

**Staðfesting gagna**:

- Prófa með vantar nauðsynleg svæði
- Prófa með ógilda gagnagerð
- Prófa með ógild snið (netfang, dagsetningar, o.s.frv.)
- Prófa jaðarskilyrði (neikvætt verð, o.s.frv.)

**Gagnagrunnur aðgerðir**:

- Prófa að búa til auðlindir
- Prófa að lesa auðlindir (stök og listar)
- Prófa að uppfæra auðlindir
- Prófa að eyða auðlindum
- Prófa tengsl milli eininga (cascading deletes, foreign keys)

#### Skipulag prófana

Skipuleggðu prófanir þínar eftir eiginleikum eða endapunktum:

- Auðkenningarprófanir (skráning, innskráning)
- Viðburðaprófanir (skoða, sía, skoða upplýsingar)
- Staðaprófanir
- Bókunarprófanir (búa til, skoða, hætta við)
- Notendaprófílprófanir

Notaðu setup og teardown til að stjórna ástandi gagnagrunnsprófa.

### Gæði kóða

- Hreinn, læsilegur, vel skipulagður kóði
- Réttar TypeScript gerðir
- Aðskilnaður áhyggjuefna (routes, controllers, models, services)
- Villumeðhöndlunarmillilög

## Skilakröfur

1. **GitHub Repository** með:

   - Fullkomnum frumkóða
   - SQL skema og seed gagnaskrám
   - Skýrum README með uppsetningarleiðbeiningum
   - Skjölun á umhverfisbreytum

2. **Skjölun**:

   - Hvernig á að setja upp og keyra verkefnið
   - Hvernig á að keyra prófanir
   - Skjölun á API endapunktum

3. **Prófanir**:
   - Allar prófanir standast
   - Góð prófunarumfjöllun

## Einkunnaskilyrði

- **Hönnun gagnagrunns (20%)**: Hönnun skema og tengsl
- **Útfærsla API (30%)**: Virkni og bestu starfsvenjur
- **Auðkenning og heimild (15%)**: Öryggisútfærsla
- **Staðfesting og villumeðhöndlun (15%)**: Staðfesting inntaks og villuviðbrögð
- **Prófanir (15%)**: Umfjöllun og gæði prófana
- **Gæði kóða og skjölun (10%)**: Skipulag kóða og skjölun

## Athugasemdir

- Notaðu mynstur og bestu starfsvenjur úr áfanganum
- Hugsaðu um jaðartilvik og villur
- Íhugaðu sveigjanleika og viðhaldshæfni
- Skrifaðu prófanir á meðan þú þróar, ekki eftir á

Gangi þér vel! 🎫
"# Lokaverkefni26" 
