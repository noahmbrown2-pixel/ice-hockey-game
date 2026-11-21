/* ============================================================
   FOOTBALL CEO — Complete Game Logic
   ============================================================ */

// --- TEAM DATA ---
const PREMIER_LEAGUE = [
  ["Arsenal","London","The Gunners — Highbury legends"],
  ["Aston Villa","Birmingham","European Cup winners 1982"],
  ["Bournemouth","Bournemouth","The Cherries — South coast dreamers"],
  ["Brentford","London","The Bees — analytics darlings"],
  ["Brighton & Hove Albion","Brighton","Seagulls and seaside vibes"],
  ["Burnley","Burnley","The Clarets of Turf Moor"],
  ["Chelsea","London","Blues from Stamford Bridge"],
  ["Crystal Palace","London","The Eagles soar at Selhurst"],
  ["Everton","Liverpool","The Toffees — oldest top-flight"],
  ["Fulham","London","Cottagers by the Thames"],
  ["Leeds United","Leeds","Marching on together"],
  ["Liverpool","Liverpool","You'll Never Walk Alone"],
  ["Manchester City","Manchester","Sky Blues — modern dynasty"],
  ["Manchester United","Manchester","Theatre of Dreams"],
  ["Newcastle United","Newcastle","Toon Army — black & white"],
  ["Nottingham Forest","Nottingham","Back-to-back European Cups"],
  ["Sunderland","Sunderland","The Black Cats roar"],
  ["Tottenham Hotspur","London","To dare is to do"],
  ["West Ham United","London","Irons forever"],
  ["Wolverhampton Wanderers","Wolverhampton","Out of Darkness Cometh Light"]
];

const CHAMPIONSHIP = [
  ["Birmingham City","Birmingham","Blues — Knighthead era"],
  ["Blackburn Rovers","Blackburn","Premier League champs 1995"],
  ["Bristol City","Bristol","Robins of Ashton Gate"],
  ["Charlton Athletic","London","The Addicks — south London"],
  ["Coventry City","Coventry","Sky Blues — FA Cup 1987"],
  ["Derby County","Derby","Rams — Brian Clough's old club"],
  ["Hull City","Hull","Tigers from East Yorkshire"],
  ["Ipswich Town","Ipswich","UEFA Cup winners 1981"],
  ["Leicester City","Leicester","Foxes — fairy-tale champions"],
  ["Middlesbrough","Middlesbrough","Boro — Riverside warriors"],
  ["Millwall","London","No one likes us, we don't care"],
  ["Norwich City","Norwich","Canaries — Carrow Road yellow"],
  ["Oxford United","Oxford","U's — League Cup 1986"],
  ["Portsmouth","Portsmouth","Pompey — Fratton Park faithful"],
  ["Preston North End","Preston","The Invincibles of 1888-89"],
  ["Queens Park Rangers","London","Hoops at Loftus Road"],
  ["Sheffield United","Sheffield","Blades from Bramall Lane"],
  ["Sheffield Wednesday","Sheffield","Owls of Hillsborough"],
  ["Southampton","Southampton","Saints from St Mary's"],
  ["Stoke City","Stoke","Potters — oldest league club"],
  ["Swansea City","Swansea","Swans — only Welsh PL champs"],
  ["Watford","Watford","Hornets in yellow & black"],
  ["West Bromwich Albion","West Bromwich","Baggies — The Hawthorns"],
  ["Wrexham","Wrexham","Hollywood comeback story"]
];

const LEAGUE_ONE = [
  ["AFC Wimbledon","London","Phoenix from the ashes"],
  ["Barnsley","Barnsley","Tykes from Oakwell"],
  ["Blackpool","Blackpool","Tangerines by the sea"],
  ["Bolton Wanderers","Bolton","Trotters — FA Cup 1958"],
  ["Bradford City","Bradford","Bantams — claret & amber"],
  ["Burton Albion","Burton","Brewers from the Pirelli"],
  ["Cardiff City","Cardiff","Bluebirds of South Wales"],
  ["Doncaster Rovers","Doncaster","Vikings from Yorkshire"],
  ["Exeter City","Exeter","Grecians from St James"],
  ["Huddersfield Town","Huddersfield","First English triple champions"],
  ["Leyton Orient","London","The O's — East London"],
  ["Lincoln City","Lincoln","Imps from Sincil Bank"],
  ["Luton Town","Luton","Hatters — Kenilworth Road"],
  ["Mansfield Town","Mansfield","Stags from Field Mill"],
  ["Northampton Town","Northampton","Cobblers — shoe heritage"],
  ["Peterborough United","Peterborough","Posh from London Road"],
  ["Plymouth Argyle","Plymouth","Pilgrims from Home Park"],
  ["Port Vale","Stoke-on-Trent","Valiants from Burslem"],
  ["Reading","Reading","Royals from Berkshire"],
  ["Rotherham United","Rotherham","Millers from AESSEAL"],
  ["Stevenage","Stevenage","Boro from Hertfordshire"],
  ["Stockport County","Stockport","Hatters from Edgeley Park"],
  ["Wigan Athletic","Wigan","FA Cup heroes 2013"],
  ["Wycombe Wanderers","High Wycombe","Chairboys from Adams Park"]
];

// ============================================================
// EUROPEAN DOMESTIC LEAGUES
// ============================================================
const EURO_LEAGUE_DATA = {
  "Serie A":      { country:"Italy",      flag:"🇮🇹", clSpots:4, elSpots:2, ueclSpots:1, teams:[
    ["Inter Milan",87],["Atalanta BC",83],["Juventus FC",83],["AC Milan",82],["SSC Napoli",84],
    ["AS Roma",80],["SS Lazio",78],["ACF Fiorentina",76],["Torino FC",73],["Bologna FC 1909",74],
    ["Udinese Calcio",70],["Empoli FC",68],["Hellas Verona",67],["Genoa CFC",69],
    ["Frosinone Calcio",65],["US Lecce",66],["Cagliari Calcio",68],["Monza",71],["Venezia FC",63],["Parma Calcio",65]
  ]},
  "LaLiga":       { country:"Spain",      flag:"🇪🇸", clSpots:5, elSpots:2, ueclSpots:1, teams:[
    ["Real Madrid CF",91],["FC Barcelona",89],["Atlético Madrid",86],["Athletic Club",78],["Villarreal CF",79],
    ["Real Betis Balompié",77],["Real Sociedad",76],["Sevilla FC",75],["Girona FC",74],
    ["Rayo Vallecano",70],["CA Osasuna",71],["Celta Vigo",69],["Deportivo Alavés",67],["Valencia CF",73],
    ["Getafe CF",68],["RCD Espanyol",67],["RCD Mallorca",69],["UD Las Palmas",66],["CD Leganés",65],["Real Valladolid",64]
  ]},
  "Bundesliga":   { country:"Germany",    flag:"🇩🇪", clSpots:4, elSpots:1, ueclSpots:1, teams:[
    ["FC Bayern Munich",89],["Bayer 04 Leverkusen",86],["Borussia Dortmund",85],["RB Leipzig",84],
    ["Eintracht Frankfurt",80],["VfB Stuttgart",79],["SC Freiburg",77],["FSV Mainz 05",75],
    ["VfL Wolfsburg",74],["Werder Bremen",73],["Borussia M'gladbach",76],["FC Augsburg",70],
    ["1. FC Union Berlin",72],["TSG Hoffenheim",71],["VfL Bochum",68],["1. FC Köln",69],
    ["FC Heidenheim",67],["SV Darmstadt 98",65]
  ]},
  "Ligue 1":      { country:"France",     flag:"🇫🇷", clSpots:2, elSpots:2, ueclSpots:1, teams:[
    ["Paris Saint-Germain",90],["Olympique de Marseille",81],["AS Monaco FC",82],["RC Lens",78],
    ["Olympique Lyonnais",79],["Stade Rennais F.C.",76],["LOSC Lille",80],["OGC Nice",77],
    ["Stade de Reims",73],["RC Strasbourg Alsace",72],["Stade Brestois 29",71],["FC Nantes",70],
    ["Toulouse FC",69],["Montpellier HSC",68],["Le Havre AC",67],["FC Metz",65],["Clermont Foot 63",64],["FC Lorient",66]
  ]},
  "Eredivisie":   { country:"Netherlands",flag:"🇳🇱", clSpots:1, elSpots:2, ueclSpots:1, teams:[
    ["PSV Eindhoven",83],["Feyenoord",81],["AFC Ajax",80],["AZ Alkmaar",78],["FC Twente",76],
    ["FC Utrecht",74],["Sparta Rotterdam",71],["FC Groningen",70],["SC Heerenveen",70],["NEC Nijmegen",69],
    ["Heracles Almelo",68],["Go Ahead Eagles",68],["RKC Waalwijk",66],["FC Volendam",64],["PEC Zwolle",65],
    ["Excelsior",63],["Almere City FC",62],["FC Emmen",61]
  ]},
  "Liga Portugal":{ country:"Portugal",   flag:"🇵🇹", clSpots:2, elSpots:1, ueclSpots:1, teams:[
    ["Sporting CP",83],["SL Benfica",84],["FC Porto",82],["SC Braga",77],["Vitória SC",74],
    ["Casa Pia AC",70],["Moreirense FC",68],["GD Estoril Praia",68],["CD Arouca",69],["GD Chaves",66],
    ["FC Vizela",65],["Rio Ave FC",67],["Gil Vicente FC",70],["FC Famalicão",66],
    ["CF Estrela da Amadora",64],["Portimonense SC",65],["SC Farense",67],["Boavista FC",68]
  ]}
};

// English PL qualification thresholds (0-indexed finish position)
const PL_CL_POS   = [0,1,2,3];
const PL_EL_POS   = [4,5];
const PL_UECL_POS = [6];

// ============================================================
// INITIAL EUROPEAN COMPETITION PARTICIPANTS
// ============================================================
const INITIAL_CL_TEAMS = [
  {name:"Liverpool F.C.",league:"Premier League",rating:88},
  {name:"Manchester City F.C.",league:"Premier League",rating:89},
  {name:"Arsenal F.C.",league:"Premier League",rating:86},
  {name:"Manchester United F.C.",league:"Premier League",rating:82},
  {name:"Chelsea F.C.",league:"Premier League",rating:83},
  {name:"Tottenham Hotspur F.C.",league:"Premier League",rating:81},
  {name:"FC Barcelona",league:"LaLiga",rating:89},
  {name:"Real Madrid CF",league:"LaLiga",rating:91},
  {name:"Atlético Madrid",league:"LaLiga",rating:86},
  {name:"Athletic Club",league:"LaLiga",rating:78},
  {name:"Villarreal CF",league:"LaLiga",rating:79},
  {name:"FC Bayern Munich",league:"Bundesliga",rating:89},
  {name:"Borussia Dortmund",league:"Bundesliga",rating:85},
  {name:"Bayer 04 Leverkusen",league:"Bundesliga",rating:86},
  {name:"RB Leipzig",league:"Bundesliga",rating:84},
  {name:"Eintracht Frankfurt",league:"Bundesliga",rating:80},
  {name:"Inter Milan",league:"Serie A",rating:87},
  {name:"SSC Napoli",league:"Serie A",rating:84},
  {name:"Juventus FC",league:"Serie A",rating:83},
  {name:"AC Milan",league:"Serie A",rating:82},
  {name:"Paris Saint-Germain",league:"Ligue 1",rating:90},
  {name:"Olympique de Marseille",league:"Ligue 1",rating:81},
  {name:"AS Monaco FC",league:"Ligue 1",rating:82},
  {name:"RC Lens",league:"Ligue 1",rating:78},
  {name:"PSV Eindhoven",league:"Eredivisie",rating:83},
  {name:"Feyenoord",league:"Eredivisie",rating:81},
  {name:"AFC Ajax",league:"Eredivisie",rating:80},
  {name:"FC Porto",league:"Liga Portugal",rating:82},
  {name:"Sporting CP",league:"Liga Portugal",rating:83},
  {name:"SL Benfica",league:"Liga Portugal",rating:84},
  {name:"Club Brugge KV",league:"Belgian Pro League",rating:78},
  {name:"Royale Union Saint-Gilloise",league:"Belgian Pro League",rating:74},
  {name:"Galatasaray S.K.",league:"Süper Lig",rating:79},
  {name:"Olympiacos F.C.",league:"Super League Greece",rating:74},
  {name:"Red Star Belgrade",league:"SuperLiga Serbia",rating:76},
  {name:"Bodø/Glimt",league:"Eliteserien",rating:72}
];
const INITIAL_EL_TEAMS = [
  {name:"Aston Villa F.C.",league:"Premier League",rating:81},
  {name:"Newcastle United F.C.",league:"Premier League",rating:80},
  {name:"Brighton & Hove Albion F.C.",league:"Premier League",rating:78},
  {name:"Real Betis Balompié",league:"LaLiga",rating:77},
  {name:"Real Sociedad",league:"LaLiga",rating:76},
  {name:"Sevilla FC",league:"LaLiga",rating:75},
  {name:"SC Freiburg",league:"Bundesliga",rating:77},
  {name:"VfB Stuttgart",league:"Bundesliga",rating:79},
  {name:"FSV Mainz 05",league:"Bundesliga",rating:75},
  {name:"AS Roma",league:"Serie A",rating:80},
  {name:"SS Lazio",league:"Serie A",rating:78},
  {name:"ACF Fiorentina",league:"Serie A",rating:76},
  {name:"Olympique Lyonnais",league:"Ligue 1",rating:79},
  {name:"Stade Rennais F.C.",league:"Ligue 1",rating:76},
  {name:"AZ Alkmaar",league:"Eredivisie",rating:78},
  {name:"FC Utrecht",league:"Eredivisie",rating:74},
  {name:"SL Benfica",league:"Liga Portugal",rating:84},
  {name:"SC Braga",league:"Liga Portugal",rating:77},
  {name:"R.S.C. Anderlecht",league:"Belgian Pro League",rating:75},
  {name:"Sint-Truiden V.V.",league:"Belgian Pro League",rating:68},
  {name:"Beşiktaş J.K.",league:"Süper Lig",rating:74},
  {name:"Trabzonspor",league:"Süper Lig",rating:73},
  {name:"RB Salzburg",league:"Austrian Bundesliga",rating:79},
  {name:"Celtic F.C.",league:"Scottish Premiership",rating:80},
  {name:"Viktoria Plzeň",league:"Czech First League",rating:72},
  {name:"PAOK FC",league:"Super League Greece",rating:74},
  {name:"FC Midtjylland",league:"Danish Superliga",rating:72},
  {name:"Malmö FF",league:"Allsvenskan",rating:71},
  {name:"Sheriff Tiraspol",league:"Moldovan National Division",rating:70},
  {name:"HJK Helsinki",league:"Veikkausliiga",rating:68},
  {name:"Qarabağ FK",league:"Azerbaijan Premier League",rating:69},
  {name:"Ludogorets Razgrad",league:"Bulgarian First League",rating:70},
  {name:"Ferencváros TC",league:"OTP Bank Liga",rating:74},
  {name:"Sparta Praha",league:"Czech First League",rating:75},
  {name:"Slavia Praha",league:"Czech First League",rating:74},
  {name:"FK Bodø/Glimt B",league:"Eliteserien",rating:70}
];
const INITIAL_UECL_TEAMS = [
  {name:"Crystal Palace F.C.",league:"Premier League",rating:74},
  {name:"AFC Bournemouth",league:"Premier League",rating:73},
  {name:"Brentford F.C.",league:"Premier League",rating:75},
  {name:"Rayo Vallecano",league:"LaLiga",rating:70},
  {name:"CA Osasuna",league:"LaLiga",rating:71},
  {name:"Girona FC",league:"LaLiga",rating:74},
  {name:"Werder Bremen",league:"Bundesliga",rating:73},
  {name:"VfL Wolfsburg",league:"Bundesliga",rating:74},
  {name:"Bologna FC 1909",league:"Serie A",rating:74},
  {name:"Torino FC",league:"Serie A",rating:73},
  {name:"RC Strasbourg Alsace",league:"Ligue 1",rating:72},
  {name:"Stade Rennais B",league:"Ligue 1",rating:70},
  {name:"FC Twente",league:"Eredivisie",rating:76},
  {name:"Go Ahead Eagles",league:"Eredivisie",rating:68},
  {name:"Vitória SC",league:"Liga Portugal",rating:74},
  {name:"Moreirense FC",league:"Liga Portugal",rating:68},
  {name:"KAA Gent",league:"Belgian Pro League",rating:72},
  {name:"Cercle Brugge K.S.V.",league:"Belgian Pro League",rating:69},
  {name:"Hibernian F.C.",league:"Scottish Premiership",rating:70},
  {name:"Aberdeen F.C.",league:"Scottish Premiership",rating:69},
  {name:"İstanbul Başakşehir F.K.",league:"Süper Lig",rating:72},
  {name:"Molde FK",league:"Eliteserien",rating:71},
  {name:"AIK Fotboll",league:"Allsvenskan",rating:69},
  {name:"Shamrock Rovers F.C.",league:"League of Ireland",rating:67},
  {name:"FC Lausanne-Sport",league:"Swiss Super League",rating:70},
  {name:"Hajduk Split",league:"HNL Croatia",rating:71},
  {name:"Austria Wien",league:"Austrian Bundesliga",rating:70},
  {name:"Legia Warsaw",league:"Ekstraklasa",rating:72},
  {name:"FC København",league:"Danish Superliga",rating:73},
  {name:"Shakhtar Donetsk",league:"Ukrainian Premier League",rating:78},
  {name:"Rapid Wien",league:"Austrian Bundesliga",rating:71},
  {name:"Maccabi Haifa F.C.",league:"Israeli Premier League",rating:70},
  {name:"Partizan Belgrade",league:"SuperLiga Serbia",rating:73},
  {name:"Rosenborg BK",league:"Eliteserien",rating:69},
  {name:"FC Basel",league:"Swiss Super League",rating:72},
  {name:"Rakow Czestochowa",league:"Ekstraklasa",rating:71}
];

const NATIONALITIES = [
  "English","Spanish","Brazilian","French","German","Portuguese","Argentinian",
  "Nigerian","Ghanaian","Senegalese","Ivorian","Dutch","Belgian","Italian",
  "Moroccan","Colombian","Uruguayan","Scottish","Welsh","Irish"
];

// Name pools by nationality region
const FIRST_NAMES = {
  English: ["Harry","Jack","Tom","James","George","Oliver","William","Charlie","Mason","Reece","Ben","Daniel","Joe","Lewis","Kyle","Connor","Liam","Jordan","Ryan","Alex","Joshua","Marcus","Ethan","Jamie","Callum","Adam","Sam","Toby","Finn","Leo"],
  Spanish: ["Diego","Carlos","Javier","Pablo","Sergio","Alvaro","Marco","Iker","Raul","Luis","Fernando","Andres","Miguel","Pedro","Joaquin","Rodrigo","Adrian","David","Nacho","Borja"],
  Brazilian: ["Carlos","Eduardo","Felipe","Gabriel","Henrique","Joao","Lucas","Matheus","Pedro","Rafael","Ricardo","Tiago","Vinicius","Bruno","Marcelo","Diego","Andre","Fabio","Caio","Leonardo"],
  French: ["Antoine","Bastien","Clement","Damien","Etienne","Florian","Guillaume","Hugo","Julien","Killian","Lucas","Mathieu","Nicolas","Olivier","Pierre","Quentin","Romain","Sebastien","Theo","Valentin"],
  German: ["Alexander","Benjamin","Christian","Daniel","Felix","Florian","Hannes","Jonas","Kevin","Lars","Maximilian","Niklas","Oliver","Patrick","Robin","Sebastian","Thomas","Tobias","Lukas","Tim"],
  Portuguese: ["Andre","Bruno","Carlos","Diogo","Eduardo","Fabio","Goncalo","Joao","Luis","Miguel","Nuno","Pedro","Ricardo","Rui","Tiago","Vasco","Bernardo","Daniel","Fernando","Hugo"],
  Argentinian: ["Agustin","Bruno","Cristian","Diego","Emiliano","Federico","Gonzalo","Hernan","Ignacio","Julian","Lucas","Mariano","Nicolas","Pablo","Rodrigo","Santiago","Tomas","Lautaro","Sergio","Martin"],
  Nigerian: ["Chinedu","Emeka","Ifeanyi","Kelechi","Obinna","Tunde","Wale","Yusuf","Samuel","Daniel","Joseph","Peter","Victor","Michael","Charles","Henry","Ade","Femi","Sunday","Kingsley"],
  Ghanaian: ["Kwame","Kofi","Yaw","Mensah","Asante","Owusu","Boateng","Asamoah","Appiah","Adu","Daniel","Samuel","Mohammed","Isaac","Joseph","Kwasi","Akwasi","Emmanuel","Solomon","Patrick"],
  Senegalese: ["Mamadou","Ibrahima","Cheikh","Moussa","Abdoulaye","Ousmane","Pape","Modou","Sadio","Idrissa","Ismaila","Boubacar","Aliou","Lamine","Diallo","Khadim","Bouna","Habib","Demba","Saliou"],
  Ivorian: ["Yaya","Didier","Salomon","Kolo","Wilfried","Serge","Eric","Max","Aurelien","Jean","Cheick","Sebastien","Nicolas","Franck","Lassina","Seydou","Habib","Ismael","Gervinho","Bonaventure"],
  Dutch: ["Daan","Sem","Lucas","Levi","Bram","Finn","Jens","Milan","Stijn","Thijs","Tim","Tom","Bas","Jan","Pieter","Ruud","Wesley","Kevin","Joris","Sven"],
  Belgian: ["Lucas","Liam","Noah","Louis","Adam","Mathis","Arthur","Hugo","Victor","Jules","Mathieu","Romain","Maxime","Thomas","Antoine","Simon","Florian","Gilles","Loic","Tom"],
  Italian: ["Alessandro","Andrea","Antonio","Davide","Federico","Francesco","Gabriele","Giovanni","Luca","Marco","Matteo","Riccardo","Roberto","Simone","Stefano","Tommaso","Vincenzo","Lorenzo","Mattia","Nicolo"],
  Moroccan: ["Mohamed","Achraf","Hakim","Yassine","Karim","Soufiane","Ayoub","Anass","Bilal","Hamza","Ilyas","Mehdi","Nabil","Omar","Rachid","Said","Tarik","Younes","Yassir","Adam"],
  Colombian: ["Andres","Camilo","Carlos","Daniel","David","Diego","Eduardo","Felipe","Gabriel","Juan","Luis","Mateo","Miguel","Nicolas","Pedro","Rafael","Sebastian","Sergio","Wilmer","Yerry"],
  Uruguayan: ["Diego","Edinson","Federico","Gaston","Hernan","Jose","Luis","Martin","Maximiliano","Nicolas","Pablo","Rodrigo","Sebastian","Sergio","Tomas","Walter","Cristian","Mauricio","Lucas","Agustin"],
  Scottish: ["Andrew","Callum","Craig","David","Euan","Finlay","Gordon","Hamish","Iain","James","Kieran","Lewis","Malcolm","Niall","Owen","Paul","Robert","Scott","Stuart","William"],
  Welsh: ["Aaron","Bryn","Carwyn","Dafydd","Emyr","Gareth","Huw","Iolo","Jac","Llewellyn","Macsen","Owain","Rhodri","Sion","Trystan","Aled","Cian","Dylan","Gethin","Iwan"],
  Irish: ["Aidan","Brendan","Ciaran","Declan","Eamonn","Finbarr","Gerry","Hugh","Irial","Jamie","Killian","Liam","Michael","Niall","Oisin","Patrick","Ronan","Sean","Tadhg","Conor"]
};

const LAST_NAMES = {
  English: ["Smith","Jones","Brown","Taylor","Wilson","Davies","Evans","Thomas","Roberts","Walker","White","Hughes","Green","Hall","Wood","Harris","Clarke","Lewis","Wright","Cooper","King","Bennett","Carter","Phillips","Turner","Parker","Edwards","Collins","Stewart","Morris"],
  Spanish: ["Garcia","Rodriguez","Martinez","Lopez","Gonzalez","Hernandez","Perez","Sanchez","Ramirez","Torres","Flores","Rivera","Gomez","Diaz","Reyes","Morales","Cruz","Ortiz","Gutierrez","Chavez"],
  Brazilian: ["Silva","Santos","Oliveira","Souza","Lima","Pereira","Ferreira","Almeida","Costa","Rodrigues","Martins","Carvalho","Gomes","Ribeiro","Alves","Barbosa","Mendes","Castro","Rocha","Dias"],
  French: ["Martin","Bernard","Thomas","Petit","Robert","Richard","Durand","Dubois","Moreau","Laurent","Simon","Michel","Lefebvre","Leroy","Roux","David","Bertrand","Morel","Fournier","Girard"],
  German: ["Mueller","Schmidt","Schneider","Fischer","Weber","Meyer","Wagner","Becker","Schulz","Hoffmann","Schaefer","Koch","Bauer","Richter","Klein","Wolf","Schroeder","Neumann","Schwarz","Zimmermann"],
  Portuguese: ["Silva","Santos","Pereira","Costa","Ferreira","Rodrigues","Martins","Sousa","Fernandes","Goncalves","Lopes","Marques","Almeida","Ribeiro","Pinto","Carvalho","Teixeira","Moreira","Correia","Mendes"],
  Argentinian: ["Gonzalez","Rodriguez","Fernandez","Lopez","Martinez","Diaz","Perez","Sanchez","Romero","Sosa","Alvarez","Torres","Ruiz","Ramirez","Flores","Acuna","Benitez","Castro","Gutierrez","Herrera"],
  Nigerian: ["Okafor","Eze","Adeyemi","Okonkwo","Nwankwo","Ogbonna","Obi","Adekunle","Balogun","Adebayor","Okocha","Oduwa","Akpan","Babatunde","Chukwu","Eboue","Iheanacho","Iwobi","Ndidi","Onuachu"],
  Ghanaian: ["Mensah","Asante","Boateng","Owusu","Gyan","Asamoah","Adu","Appiah","Acheampong","Atsu","Kwarteng","Ofori","Sarpong","Frimpong","Sulemana","Partey","Wakaso","Yiadom","Acquah","Bediako"],
  Senegalese: ["Diallo","Diop","Ndiaye","Sarr","Mbaye","Sow","Gueye","Niang","Faye","Ba","Kane","Cisse","Sane","Mane","Diatta","Mendy","Konate","Dieng","Loum","Ciss"],
  Ivorian: ["Toure","Drogba","Kalou","Eboue","Gervinho","Zaha","Kone","Tiote","Doumbia","Bony","Pepe","Kessie","Bailly","Diomande","Aurier","Boli","Cornet","Bamba","Ndoye","Aka"],
  Dutch: ["de Vries","Jansen","van den Berg","van Dijk","Bakker","Janssen","Visser","Smit","Meijer","de Boer","Mulder","de Groot","Bos","Vos","Peters","Hendriks","van Leeuwen","Dekker","Brouwer","de Wit"],
  Belgian: ["Peeters","Janssens","Maes","Jacobs","Mertens","Willems","Claes","Goossens","Wouters","De Smet","Hermans","Lemmens","Dupont","Lambert","Martens","Pauwels","Stevens","Aerts","Coppens","De Vos"],
  Italian: ["Rossi","Russo","Ferrari","Esposito","Bianchi","Romano","Colombo","Ricci","Marino","Greco","Bruno","Gallo","Conti","De Luca","Mancini","Costa","Giordano","Rizzo","Lombardi","Moretti"],
  Moroccan: ["El Amrani","Benali","Idrissi","Chaoui","Berrada","Tazi","El Fassi","Hakimi","Belmadi","Ouedraogo","Ziyech","Mazraoui","Saiss","Boufal","Amrabat","En-Nesyri","Mmaee","Hamdallah","Aguerd","Cheddira"],
  Colombian: ["Rodriguez","Gomez","Martinez","Garcia","Lopez","Gonzalez","Hernandez","Sanchez","Ramirez","Torres","Castro","Ospina","Cuadrado","Falcao","James","Borja","Mina","Davinson","Lerma","Mojica"],
  Uruguayan: ["Suarez","Cavani","Forlan","Godin","Gimenez","Bentancur","Valverde","Nunez","Pellistri","Vecino","Caceres","Coates","Olivera","De Arrascaeta","Torreira","Rodriguez","Gomez","Pereira","Lopez","Silva"],
  Scottish: ["MacDonald","Campbell","Stewart","Robertson","Smith","Brown","Wilson","Reid","Thomson","Murray","Anderson","Scott","Ross","Watson","Mitchell","Walker","Fraser","Henderson","Morrison","Cameron"],
  Welsh: ["Jones","Williams","Davies","Evans","Thomas","Roberts","Hughes","Lewis","Morgan","Griffiths","Edwards","Owen","Powell","Phillips","Rees","Bevan","Pugh","Tudor","Vaughan","Wynne"],
  Irish: ["Murphy","O'Sullivan","Kelly","Walsh","O'Brien","Byrne","Ryan","O'Connor","O'Neill","Reilly","Doyle","McCarthy","Gallagher","Doherty","Lynch","Kennedy","Quinn","Moore","McLoughlin","O'Hara"]
};

const POSITIONS = {
  GK: { group: "GK" },
  CB: { group: "DEF" }, SW: { group: "DEF" },
  LB: { group: "DEF" }, RB: { group: "DEF" },
  LWB: { group: "DEF" }, RWB: { group: "DEF" },
  CDM: { group: "MID" }, CM: { group: "MID" }, CAM: { group: "MID" },
  LM: { group: "MID" }, RM: { group: "MID" },
  LW: { group: "MID" }, RW: { group: "MID" },
  ST: { group: "FWD" }, CF: { group: "FWD" }, SS: { group: "FWD" }
};

const COACH_ROLES = [
  "Head Coach","Assistant Coach","Goalkeeper Coach","Fitness Coach",
  "Set-Piece Coach","Attacking Coach","Defensive Coach","Data Analyst",
  "Physiotherapist","First-Team Coach","Performance Analyst","Team Doctor",
  "Mental Performance Coach","Nutritionist"
];

