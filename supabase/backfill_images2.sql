-- Photos for every entry that lacked one, sourced from Wikimedia Commons.
--
-- Every image is CC0, Public Domain, CC BY or CC BY-SA - verified against the
-- file's extmetadata at selection time, not assumed. Credit (author, licence,
-- source page) rides along in image_credit, which the licences require.
--
-- Cars and jets are model-representative shots (image_is_representative =
-- true): they show the machine, not the person's machine. Yachts and famous
-- buildings are the actual thing. Private homes with no free photo keep the
-- monogram placeholder on purpose - see docs/IMAGES.md.
--
-- `and image_url is null` keeps this script from clobbering anything a
-- contributor has uploaded since.

update celebrities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/3/3c/50_cent_in_concert.jpg',
  image_credit = '{"url": "https://upload.wikimedia.org/wikipedia/commons/3/3c/50_cent_in_concert.jpg", "author": "Alex Const", "license": "CC BY 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:50_cent_in_concert.jpg"}'::jsonb
where slug = '50-cent' and image_url is null;

update celebrities set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Bad_Bunny_at_Forbes_Under_30_2023.jpg/1280px-Bad_Bunny_at_Forbes_Under_30_2023.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Bad_Bunny_at_Forbes_Under_30_2023.jpg/1280px-Bad_Bunny_at_Forbes_Under_30_2023.jpg", "author": "Monika Ilieva", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Bad_Bunny_at_Forbes_Under_30_2023.jpg"}'::jsonb
where slug = 'bad-bunny' and image_url is null;

update celebrities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/4/47/Beyonce_%288479448221%29.png',
  image_credit = '{"url": "https://upload.wikimedia.org/wikipedia/commons/4/47/Beyonce_%288479448221%29.png", "author": "Topher McCulloch from Chicago, IL, United States", "license": "CC BY 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Beyonce_(8479448221).png"}'::jsonb
where slug = 'beyonce' and image_url is null;

update celebrities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/4/47/Birdman_2024.jpg',
  image_credit = '{"url": "https://upload.wikimedia.org/wikipedia/commons/4/47/Birdman_2024.jpg", "author": "The 85 South Comedy Show", "license": "CC BY 3.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Birdman_2024.jpg"}'::jsonb
where slug = 'birdman' and image_url is null;

update celebrities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/8/82/Sa%C3%BAl_%C3%81lvarez.png',
  image_credit = '{"url": "https://upload.wikimedia.org/wikipedia/commons/8/82/Sa%C3%BAl_%C3%81lvarez.png", "author": "Box Azteca", "license": "CC BY 3.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Sa%C3%BAl_%C3%81lvarez.png"}'::jsonb
where slug = 'canelo-alvarez' and image_url is null;

update celebrities set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/Conor_McGregor_2015.jpg/1280px-Conor_McGregor_2015.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/Conor_McGregor_2015.jpg/1280px-Conor_McGregor_2015.jpg", "author": "Andrius Petrucenia", "license": "CC BY-SA 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Conor_McGregor_2015.jpg"}'::jsonb
where slug = 'conor-mcgregor' and image_url is null;

update celebrities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Cristiano_Ronaldo_with_Al_Nassr%2C_19_September_2023_-_44.jpg',
  image_credit = '{"url": "https://upload.wikimedia.org/wikipedia/commons/5/5b/Cristiano_Ronaldo_with_Al_Nassr%2C_19_September_2023_-_44.jpg", "author": "Mohammadreza Abbasi", "license": "CC BY 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Cristiano_Ronaldo_with_Al_Nassr,_19_September_2023_-_44.jpg"}'::jsonb
where slug = 'cristiano-ronaldo' and image_url is null;

update celebrities set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/Daddy_Yankee%2C_Con_Calma_Tour_2019.jpg/1280px-Daddy_Yankee%2C_Con_Calma_Tour_2019.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/Daddy_Yankee%2C_Con_Calma_Tour_2019.jpg/1280px-Daddy_Yankee%2C_Con_Calma_Tour_2019.jpg", "author": "Apoxyomenus", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Daddy_Yankee,_Con_Calma_Tour_2019.jpg"}'::jsonb
where slug = 'daddy-yankee' and image_url is null;

update celebrities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Sean_Combs_%282023%29.jpg',
  image_credit = '{"url": "https://upload.wikimedia.org/wikipedia/commons/b/b9/Sean_Combs_%282023%29.jpg", "author": "HOTSPOTATL", "license": "CC BY 3.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Sean_Combs_(2023).jpg"}'::jsonb
where slug = 'diddy' and image_url is null;

update celebrities set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Dwayne_Johnson_Daytona_500_2024_8246701_%28cropped%29.jpg/1280px-Dwayne_Johnson_Daytona_500_2024_8246701_%28cropped%29.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Dwayne_Johnson_Daytona_500_2024_8246701_%28cropped%29.jpg/1280px-Dwayne_Johnson_Daytona_500_2024_8246701_%28cropped%29.jpg", "author": "Spc. Casey Brumbach", "license": "Public domain", "sourcePage": "https://commons.wikimedia.org/wiki/File:Dwayne_Johnson_Daytona_500_2024_8246701_(cropped).jpg"}'::jsonb
where slug = 'dwayne-johnson' and image_url is null;

update celebrities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/f/f2/French_Montana_HYPE_Festival_2017_Oberhausen_DE.jpg',
  image_credit = '{"url": "https://upload.wikimedia.org/wikipedia/commons/f/f2/French_Montana_HYPE_Festival_2017_Oberhausen_DE.jpg", "author": "Alex1337 w", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:French_Montana_HYPE_Festival_2017_Oberhausen_DE.jpg"}'::jsonb
where slug = 'french-montana' and image_url is null;

update celebrities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/2/2b/George_Clooney_Cannes_2016.jpg',
  image_credit = '{"url": "https://upload.wikimedia.org/wikipedia/commons/2/2b/George_Clooney_Cannes_2016.jpg", "author": "Georges Biard", "license": "CC BY-SA 3.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:George_Clooney_Cannes_2016.jpg"}'::jsonb
where slug = 'george-clooney' and image_url is null;

update celebrities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/8/82/Hassanal_Bolkiah_%2848989161738%29.jpg',
  image_credit = '{"url": "https://upload.wikimedia.org/wikipedia/commons/8/82/Hassanal_Bolkiah_%2848989161738%29.jpg", "author": "Australian Embassy Jakarta", "license": "CC BY 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Hassanal_Bolkiah_(48989161738).jpg"}'::jsonb
where slug = 'hassanal-bolkiah' and image_url is null;

update celebrities set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Jeff_Bezos_at_Amazon_Spheres_Grand_Opening_in_Seattle_-_2018_%2839074799225%29.jpg/1280px-Jeff_Bezos_at_Amazon_Spheres_Grand_Opening_in_Seattle_-_2018_%2839074799225%29.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Jeff_Bezos_at_Amazon_Spheres_Grand_Opening_in_Seattle_-_2018_%2839074799225%29.jpg/1280px-Jeff_Bezos_at_Amazon_Spheres_Grand_Opening_in_Seattle_-_2018_%2839074799225%29.jpg", "author": "Seattle City Council from Seattle", "license": "CC BY 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Jeff_Bezos_at_Amazon_Spheres_Grand_Opening_in_Seattle_-_2018_(39074799225).jpg"}'::jsonb
where slug = 'jeff-bezos' and image_url is null;

update celebrities set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Justin_Bieber_%2825830598702%29.jpg/1280px-Justin_Bieber_%2825830598702%29.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Justin_Bieber_%2825830598702%29.jpg/1280px-Justin_Bieber_%2825830598702%29.jpg", "author": "Travis Wise from Bay Area, California, United States", "license": "CC BY 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Justin_Bieber_(25830598702).jpg"}'::jsonb
where slug = 'justin-bieber' and image_url is null;

update celebrities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/2/2b/JJ_Olatunji_%28KSI%29_1.jpg',
  image_credit = '{"url": "https://upload.wikimedia.org/wikipedia/commons/2/2b/JJ_Olatunji_%28KSI%29_1.jpg", "author": "Gymshark", "license": "CC BY 3.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:JJ_Olatunji_(KSI)_1.jpg"}'::jsonb
where slug = 'ksi' and image_url is null;

update celebrities set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Larry_Ellison_2013_%289887589546%29.jpg/1280px-Larry_Ellison_2013_%289887589546%29.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Larry_Ellison_2013_%289887589546%29.jpg/1280px-Larry_Ellison_2013_%289887589546%29.jpg", "author": "Oracle PR from Redwood Shores, Calif., USA", "license": "CC BY 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Larry_Ellison_2013_(9887589546).jpg"}'::jsonb
where slug = 'larry-ellison' and image_url is null;

update celebrities set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/LeBron_James%2C_25_November_2023_01_%28cropped%29.jpg/1280px-LeBron_James%2C_25_November_2023_01_%28cropped%29.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/LeBron_James%2C_25_November_2023_01_%28cropped%29.jpg/1280px-LeBron_James%2C_25_November_2023_01_%28cropped%29.jpg", "author": "Erik Drost", "license": "CC BY 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:LeBron_James,_25_November_2023_01_(cropped).jpg"}'::jsonb
where slug = 'lebron-james' and image_url is null;

update celebrities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Leonardo_DiCaprio_2016.jpg',
  image_credit = '{"url": "https://upload.wikimedia.org/wikipedia/commons/e/e7/Leonardo_DiCaprio_2016.jpg", "author": "Georges Biard", "license": "CC BY-SA 3.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Leonardo_DiCaprio_2016.jpg"}'::jsonb
where slug = 'leonardo-dicaprio' and image_url is null;

update celebrities set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Li_Ka_Shing_2010.jpg/1280px-Li_Ka_Shing_2010.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Li_Ka_Shing_2010.jpg/1280px-Li_Ka_Shing_2010.jpg", "author": "EdTech Stanford University School of Medicine", "license": "CC BY 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Li_Ka_Shing_2010.jpg"}'::jsonb
where slug = 'li-ka-shing' and image_url is null;

update celebrities set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e6/Logan_Paul%2C_WrestleMania_XL_in_2024_1_%28cropped%29.jpg/1280px-Logan_Paul%2C_WrestleMania_XL_in_2024_1_%28cropped%29.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e6/Logan_Paul%2C_WrestleMania_XL_in_2024_1_%28cropped%29.jpg/1280px-Logan_Paul%2C_WrestleMania_XL_in_2024_1_%28cropped%29.jpg", "author": "diegofernandophotography", "license": "CC BY 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Logan_Paul,_WrestleMania_XL_in_2024_1_(cropped).jpg"}'::jsonb
where slug = 'logan-paul' and image_url is null;

update celebrities set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bf/King_Rama_X_official_%28crop%29.png/1280px-King_Rama_X_official_%28crop%29.png',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bf/King_Rama_X_official_%28crop%29.png/1280px-King_Rama_X_official_%28crop%29.png", "author": "The Public Relations Department (กรมประชาสัมพันธ์)", "license": "CC BY 3.0 th", "sourcePage": "https://commons.wikimedia.org/wiki/File:King_Rama_X_official_(crop).png"}'::jsonb
where slug = 'maha-vajiralongkorn' and image_url is null;

update celebrities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Mohammed_bin_Rashid_Al_Maktoum_%2815-02-2021%29.jpg',
  image_credit = '{"url": "https://upload.wikimedia.org/wikipedia/commons/d/d6/Mohammed_bin_Rashid_Al_Maktoum_%2815-02-2021%29.jpg", "author": "http://www.president.gov.ua/", "license": "CC BY 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Mohammed_bin_Rashid_Al_Maktoum_(15-02-2021).jpg"}'::jsonb
where slug = 'mohammed-bin-rashid' and image_url is null;

update celebrities set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Secretary_Blinken_Meets_with_Saudi_Crown_Prince_and_Prime_Minister_Mohammed_bin_Salman.jpg/1280px-Secretary_Blinken_Meets_with_Saudi_Crown_Prince_and_Prime_Minister_Mohammed_bin_Salman.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Secretary_Blinken_Meets_with_Saudi_Crown_Prince_and_Prime_Minister_Mohammed_bin_Salman.jpg/1280px-Secretary_Blinken_Meets_with_Saudi_Crown_Prince_and_Prime_Minister_Mohammed_bin_Salman.jpg", "author": "U.S. Department of State", "license": "Public domain", "sourcePage": "https://commons.wikimedia.org/wiki/File:Secretary_Blinken_Meets_with_Saudi_Crown_Prince_and_Prime_Minister_Mohammed_bin_Salman.jpg"}'::jsonb
where slug = 'mohammed-bin-salman' and image_url is null;

update celebrities set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/MrBeast_2023_%28cropped%29.jpg/1280px-MrBeast_2023_%28cropped%29.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/MrBeast_2023_%28cropped%29.jpg/1280px-MrBeast_2023_%28cropped%29.jpg", "author": "Steven Khan", "license": "CC BY 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:MrBeast_2023_(cropped).jpg"}'::jsonb
where slug = 'mrbeast' and image_url is null;

update celebrities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/8/82/Mukesh_Ambani_was_Awarded_the_Asia_Society_Leadership_Award.jpg',
  image_credit = '{"url": "https://upload.wikimedia.org/wikipedia/commons/8/82/Mukesh_Ambani_was_Awarded_the_Asia_Society_Leadership_Award.jpg", "author": "Own Work", "license": "CC0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Mukesh_Ambani_was_Awarded_the_Asia_Society_Leadership_Award.jpg"}'::jsonb
where slug = 'mukesh-ambani' and image_url is null;

update celebrities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Neymar_Jr._with_Al_Hilal%2C_3_October_2023_-_01.jpg',
  image_credit = '{"url": "https://upload.wikimedia.org/wikipedia/commons/3/3d/Neymar_Jr._with_Al_Hilal%2C_3_October_2023_-_01.jpg", "author": "مقداد مددی", "license": "CC BY 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Neymar_Jr._with_Al_Hilal,_3_October_2023_-_01.jpg"}'::jsonb
where slug = 'neymar' and image_url is null;

update celebrities set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/Nicki_Minaj_%2855022818380%29.jpg/1280px-Nicki_Minaj_%2855022818380%29.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/Nicki_Minaj_%2855022818380%29.jpg/1280px-Nicki_Minaj_%2855022818380%29.jpg", "author": "Gage Skidmore from Surprise, AZ, United States of America", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Nicki_Minaj_(55022818380).jpg"}'::jsonb
where slug = 'nicki-minaj' and image_url is null;

update celebrities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Post_Malone_Stavernfestivalen_2018_%28202032%29.jpg',
  image_credit = '{"url": "https://upload.wikimedia.org/wikipedia/commons/8/8d/Post_Malone_Stavernfestivalen_2018_%28202032%29.jpg", "author": "Tore Sætre", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Post_Malone_Stavernfestivalen_2018_(202032).jpg"}'::jsonb
where slug = 'post-malone' and image_url is null;

update celebrities set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/Rick_Ross_The_Mastermind_Tour_June_15%2C_2014_Toronto_%2814590434716%29_%28cropped%29.jpg/1280px-Rick_Ross_The_Mastermind_Tour_June_15%2C_2014_Toronto_%2814590434716%29_%28cropped%29.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/Rick_Ross_The_Mastermind_Tour_June_15%2C_2014_Toronto_%2814590434716%29_%28cropped%29.jpg/1280px-Rick_Ross_The_Mastermind_Tour_June_15%2C_2014_Toronto_%2814590434716%29_%28cropped%29.jpg", "author": "The Come Up Show from Canada", "license": "CC BY 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Rick_Ross_The_Mastermind_Tour_June_15,_2014_Toronto_(14590434716)_(cropped).jpg"}'::jsonb
where slug = 'rick-ross' and image_url is null;

update celebrities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Rihanna_Fenty_2018_2.png',
  image_credit = '{"url": "https://upload.wikimedia.org/wikipedia/commons/e/e4/Rihanna_Fenty_2018_2.png", "author": "SIGMA", "license": "CC BY 3.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Rihanna_Fenty_2018_2.png"}'::jsonb
where slug = 'rihanna' and image_url is null;

update celebrities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/7/77/Mansour_bin_Zayed_Al_Nahyan.jpg',
  image_credit = '{"url": "https://upload.wikimedia.org/wikipedia/commons/7/77/Mansour_bin_Zayed_Al_Nahyan.jpg", "author": "UAE Saif", "license": "CC0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Mansour_bin_Zayed_Al_Nahyan.jpg"}'::jsonb
where slug = 'sheikh-mansour' and image_url is null;

update celebrities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Taylor_Swift_2024_%28cropped%29.jpg',
  image_credit = '{"url": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Taylor_Swift_2024_%28cropped%29.jpg", "author": "iHeartRadioCA", "license": "CC BY 3.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Taylor_Swift_2024_(cropped).jpg"}'::jsonb
where slug = 'taylor-swift' and image_url is null;

update celebrities set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Tom_Cruise_%2853018315112%29.png/1280px-Tom_Cruise_%2853018315112%29.png',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Tom_Cruise_%2853018315112%29.png/1280px-Tom_Cruise_%2853018315112%29.png", "author": "Eva Rinaldi from Abbotsford, Australia", "license": "CC BY-SA 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Tom_Cruise_(53018315112).png"}'::jsonb
where slug = 'tom-cruise' and image_url is null;

update celebrities set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/Travis_Scott_-_Openair_Frauenfeld_2019_03.jpg/1280px-Travis_Scott_-_Openair_Frauenfeld_2019_03.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/Travis_Scott_-_Openair_Frauenfeld_2019_03.jpg/1280px-Travis_Scott_-_Openair_Frauenfeld_2019_03.jpg", "author": "Frank Schwichtenberg", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Travis_Scott_-_Openair_Frauenfeld_2019_03.jpg"}'::jsonb
where slug = 'travis-scott' and image_url is null;

update celebrities set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Will_Smith_2011%2C_2.jpg/1280px-Will_Smith_2011%2C_2.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Will_Smith_2011%2C_2.jpg/1280px-Will_Smith_2011%2C_2.jpg", "author": "Walmart Stores", "license": "CC BY 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Will_Smith_2011,_2.jpg"}'::jsonb
where slug = 'will-smith' and image_url is null;

update celebrities set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Kanye_West_Lollapalooza_Chile_2011_1.jpg/1280px-Kanye_West_Lollapalooza_Chile_2011_1.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Kanye_West_Lollapalooza_Chile_2011_1.jpg/1280px-Kanye_West_Lollapalooza_Chile_2011_1.jpg", "author": "rodrigoferrari", "license": "CC BY-SA 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Kanye_West_Lollapalooza_Chile_2011_1.jpg"}'::jsonb
where slug = 'kanye-west' and image_url is null;

-- assets ------------------------------

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/Dubai_Yacht_at_Port_Rashid.jpg/1280px-Dubai_Yacht_at_Port_Rashid.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/Dubai_Yacht_at_Port_Rashid.jpg/1280px-Dubai_Yacht_at_Port_Rashid.jpg", "author": "Ahsan Younas", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Dubai_Yacht_at_Port_Rashid.jpg"}'::jsonb,
  image_is_representative = false
where slug = 'mohammed-bin-rashid-dubai' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9f/Koru_Superyacht.jpg/1280px-Koru_Superyacht.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9f/Koru_Superyacht.jpg/1280px-Koru_Superyacht.jpg", "author": "Conmat13", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Koru_Superyacht.jpg"}'::jsonb,
  image_is_representative = false
where slug = 'jeff-bezos-koru' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/Musashi_%287248214726%29.jpg/1280px-Musashi_%287248214726%29.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/Musashi_%287248214726%29.jpg/1280px-Musashi_%287248214726%29.jpg", "author": "Tony Hisgett from Birmingham, UK", "license": "CC BY 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Musashi_(7248214726).jpg"}'::jsonb,
  image_is_representative = false
where slug = 'larry-ellison-musashi' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/Rising_Sun_%28yacht%29_2006.jpg/1280px-Rising_Sun_%28yacht%29_2006.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/Rising_Sun_%28yacht%29_2006.jpg/1280px-Rising_Sun_%28yacht%29_2006.jpg", "author": "Flickr user reivax", "license": "CC BY-SA 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Rising_Sun_(yacht)_2006.jpg"}'::jsonb,
  image_is_representative = false
where slug = 'larry-ellison-rising-sun' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/Serene_2.jpg/1280px-Serene_2.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/Serene_2.jpg/1280px-Serene_2.jpg", "author": "Nick Wells (Ngw2009 at English Wikipedia)", "license": "CC0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Serene_2.jpg"}'::jsonb,
  image_is_representative = false
where slug = 'mohammed-bin-salman-serene' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/My_Solaris_in_G%C3%B6cek_2025.jpg/1280px-My_Solaris_in_G%C3%B6cek_2025.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/My_Solaris_in_G%C3%B6cek_2025.jpg/1280px-My_Solaris_in_G%C3%B6cek_2025.jpg", "author": "Karachun", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:My_Solaris_in_G%C3%B6cek_2025.jpg"}'::jsonb,
  image_is_representative = false
where slug = 'roman-abramovich-solaris' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b2/Antilia.JPG/1280px-Antilia.JPG',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b2/Antilia.JPG/1280px-Antilia.JPG", "author": "Krupasindhu Muduli", "license": "CC BY-SA 3.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Antilia.JPG"}'::jsonb,
  image_is_representative = false
where slug = 'mukesh-ambani-antilia' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Istana_Nurul_Iman_%2814052021%29.jpg/1280px-Istana_Nurul_Iman_%2814052021%29.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Istana_Nurul_Iman_%2814052021%29.jpg/1280px-Istana_Nurul_Iman_%2814052021%29.jpg", "author": "DeltaSquad833", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Istana_Nurul_Iman_(14052021).jpg"}'::jsonb,
  image_is_representative = false
where slug = 'hassanal-bolkiah-istana-nurul-iman' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Villa_Clooney_in_Laglio_2366.jpg/1280px-Villa_Clooney_in_Laglio_2366.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Villa_Clooney_in_Laglio_2366.jpg/1280px-Villa_Clooney_in_Laglio_2366.jpg", "author": "Henry Kellner", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Villa_Clooney_in_Laglio_2366.jpg"}'::jsonb,
  image_is_representative = false
where slug = 'george-clooney-villa-oleandra' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/Gulfstream_G650ER%2C_EBACE_2018%2C_Le_Grand-Saconnex_%28BL7C0734%29.jpg/1280px-Gulfstream_G650ER%2C_EBACE_2018%2C_Le_Grand-Saconnex_%28BL7C0734%29.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/Gulfstream_G650ER%2C_EBACE_2018%2C_Le_Grand-Saconnex_%28BL7C0734%29.jpg/1280px-Gulfstream_G650ER%2C_EBACE_2018%2C_Le_Grand-Saconnex_%28BL7C0734%29.jpg", "author": "Matti Blume", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Gulfstream_G650ER,_EBACE_2018,_Le_Grand-Saconnex_(BL7C0734).jpg"}'::jsonb,
  image_is_representative = true
where slug = 'elon-musk-gulfstream-g650er' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/EC-MLR_Gulfstream_G650_SCQ_03.jpg/1280px-EC-MLR_Gulfstream_G650_SCQ_03.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/EC-MLR_Gulfstream_G650_SCQ_03.jpg/1280px-EC-MLR_Gulfstream_G650_SCQ_03.jpg", "author": "Bene Riobó", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:EC-MLR_Gulfstream_G650_SCQ_03.jpg"}'::jsonb,
  image_is_representative = true
where slug = 'cristiano-ronaldo-gulfstream-g650' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Bombardier_BD-700-1A10_Global_Express_XRS_%28N84YU%2C_cn_9300%29_%281-18-2026%29.jpg/1280px-Bombardier_BD-700-1A10_Global_Express_XRS_%28N84YU%2C_cn_9300%29_%281-18-2026%29.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Bombardier_BD-700-1A10_Global_Express_XRS_%28N84YU%2C_cn_9300%29_%281-18-2026%29.jpg/1280px-Bombardier_BD-700-1A10_Global_Express_XRS_%28N84YU%2C_cn_9300%29_%281-18-2026%29.jpg", "author": "ZLEA", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Bombardier_BD-700-1A10_Global_Express_XRS_(N84YU,_cn_9300)_(1-18-2026).jpg"}'::jsonb,
  image_is_representative = true
where slug = 'cristiano-ronaldo-global-express' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Bombardier_Challenger_300_N102CL_MD1.jpg/1280px-Bombardier_Challenger_300_N102CL_MD1.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Bombardier_Challenger_300_N102CL_MD1.jpg/1280px-Bombardier_Challenger_300_N102CL_MD1.jpg", "author": "Acroterion", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Bombardier_Challenger_300_N102CL_MD1.jpg"}'::jsonb,
  image_is_representative = true
where slug = 'tom-cruise-challenger-300' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Gulfstream_G-IV_N316VB_BWI_MD1.jpg/1280px-Gulfstream_G-IV_N316VB_BWI_MD1.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Gulfstream_G-IV_N316VB_BWI_MD1.jpg/1280px-Gulfstream_G-IV_N316VB_BWI_MD1.jpg", "author": "Acroterion", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Gulfstream_G-IV_N316VB_BWI_MD1.jpg"}'::jsonb,
  image_is_representative = true
where slug = 'tom-cruise-gulfstream-iv' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Honda_HA-420_HondaJet_%28N120GE%2C_cn_42000129%29_%2812-9-2024%29.jpg/1280px-Honda_HA-420_HondaJet_%28N120GE%2C_cn_42000129%29_%2812-9-2024%29.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Honda_HA-420_HondaJet_%28N120GE%2C_cn_42000129%29_%2812-9-2024%29.jpg/1280px-Honda_HA-420_HondaJet_%28N120GE%2C_cn_42000129%29_%2812-9-2024%29.jpg", "author": "ZLEA", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Honda_HA-420_HondaJet_(N120GE,_cn_42000129)_(12-9-2024).jpg"}'::jsonb,
  image_is_representative = true
where slug = 'tom-cruise-hondajet' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/75/North_American_P-51D_Mustang_%27413318_C5-N%27_%22Frenesi%22_%28N357FG%29_%2845480682931%29.jpg/1280px-North_American_P-51D_Mustang_%27413318_C5-N%27_%22Frenesi%22_%28N357FG%29_%2845480682931%29.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/75/North_American_P-51D_Mustang_%27413318_C5-N%27_%22Frenesi%22_%28N357FG%29_%2845480682931%29.jpg/1280px-North_American_P-51D_Mustang_%27413318_C5-N%27_%22Frenesi%22_%28N357FG%29_%2845480682931%29.jpg", "author": "Alan Wilson from Stilton, Peterborough, Cambs, UK", "license": "CC BY-SA 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:North_American_P-51D_Mustang_%27413318_C5-N%27_%22Frenesi%22_(N357FG)_(45480682931).jpg"}'::jsonb,
  image_is_representative = true
where slug = 'tom-cruise-p51-mustang' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Cessna_Citation_Sovereign_N680BF_FDK_MD1.jpg/1280px-Cessna_Citation_Sovereign_N680BF_FDK_MD1.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Cessna_Citation_Sovereign_N680BF_FDK_MD1.jpg/1280px-Cessna_Citation_Sovereign_N680BF_FDK_MD1.jpg", "author": "Acroterion", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Cessna_Citation_Sovereign_N680BF_FDK_MD1.jpg"}'::jsonb,
  image_is_representative = true
where slug = 'neymar-citation-sovereign' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c3/2022_Bugatti_Centodieci.jpg/1280px-2022_Bugatti_Centodieci.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c3/2022_Bugatti_Centodieci.jpg/1280px-2022_Bugatti_Centodieci.jpg", "author": "MrWalkr", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:2022_Bugatti_Centodieci.jpg"}'::jsonb,
  image_is_representative = true
where slug = 'cristiano-ronaldo-bugatti-centodieci' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/Bugatti_Chiron%2C_GIMS_2018%2C_Le_Grand-Saconnex_%281X7A1765%29.jpg/1280px-Bugatti_Chiron%2C_GIMS_2018%2C_Le_Grand-Saconnex_%281X7A1765%29.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/Bugatti_Chiron%2C_GIMS_2018%2C_Le_Grand-Saconnex_%281X7A1765%29.jpg/1280px-Bugatti_Chiron%2C_GIMS_2018%2C_Le_Grand-Saconnex_%281X7A1765%29.jpg", "author": "Matti Blume", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Bugatti_Chiron,_GIMS_2018,_Le_Grand-Saconnex_(1X7A1765).jpg"}'::jsonb,
  image_is_representative = true
where slug = 'cristiano-ronaldo-bugatti-chiron' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Bugatti_Chiron%2C_IAA_2017%2C_Frankfurt_%281Y7A2855%29.jpg/1280px-Bugatti_Chiron%2C_IAA_2017%2C_Frankfurt_%281Y7A2855%29.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Bugatti_Chiron%2C_IAA_2017%2C_Frankfurt_%281Y7A2855%29.jpg/1280px-Bugatti_Chiron%2C_IAA_2017%2C_Frankfurt_%281Y7A2855%29.jpg", "author": "Matti Blume", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Bugatti_Chiron,_IAA_2017,_Frankfurt_(1Y7A2855).jpg"}'::jsonb,
  image_is_representative = true
where slug = 'canelo-alvarez-bugatti-chiron' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/2013_Bugatti_Veyron_Grand_Sport_Vitesse_SCD24.jpg/1280px-2013_Bugatti_Veyron_Grand_Sport_Vitesse_SCD24.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/2013_Bugatti_Veyron_Grand_Sport_Vitesse_SCD24.jpg/1280px-2013_Bugatti_Veyron_Grand_Sport_Vitesse_SCD24.jpg", "author": "MrWalkr", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:2013_Bugatti_Veyron_Grand_Sport_Vitesse_SCD24.jpg"}'::jsonb,
  image_is_representative = true
where slug = 'cristiano-ronaldo-bugatti-veyron' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/Ferrari_LaFerrari_GIMS_2024_1X7A2272.jpg/1280px-Ferrari_LaFerrari_GIMS_2024_1X7A2272.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/Ferrari_LaFerrari_GIMS_2024_1X7A2272.jpg/1280px-Ferrari_LaFerrari_GIMS_2024_1X7A2272.jpg", "author": "Alexander-93", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Ferrari_LaFerrari_GIMS_2024_1X7A2272.jpg"}'::jsonb,
  image_is_representative = true
where slug = 'dwayne-johnson-laferrari' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Geneva_MotorShow_2013_-_Pagani_Huayra_blue_front_lights.jpg/1280px-Geneva_MotorShow_2013_-_Pagani_Huayra_blue_front_lights.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Geneva_MotorShow_2013_-_Pagani_Huayra_blue_front_lights.jpg/1280px-Geneva_MotorShow_2013_-_Pagani_Huayra_blue_front_lights.jpg", "author": "Clément Bucco-Lechat", "license": "CC BY-SA 3.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Geneva_MotorShow_2013_-_Pagani_Huayra_blue_front_lights.jpg"}'::jsonb,
  image_is_representative = true
where slug = 'dwayne-johnson-pagani-huayra' and image_url is null;

update assets set image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Mercedes-AMG_One_IAA_2023_1X7A0454.jpg/1280px-Mercedes-AMG_One_IAA_2023_1X7A0454.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Mercedes-AMG_One_IAA_2023_1X7A0454.jpg/1280px-Mercedes-AMG_One_IAA_2023_1X7A0454.jpg", "author": "Alexander-93", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Mercedes-AMG_One_IAA_2023_1X7A0454.jpg"}'::jsonb,
  image_is_representative = true
where slug = 'cristiano-ronaldo-mercedes-amg-one' and image_url is null;
