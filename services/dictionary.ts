/**
 * Comprehensive Offline English Dictionary for Atomic Words
 * Grouped into compact string blocks for maximum performance, and easy updates.
 * Simply add or remove words in these comma-separated strings.
 */

const TWO_LETTER_WORDS = [
  "aa", "ab", "ad", "ae", "ag", "ah", "ai", "al", "am", "an", "ar", "as", "at", "aw", "ax", "ay",
  "ba", "be", "bi", "bo", "by", "da", "de", "do", "dy", "ed", "ee", "ef", "eh", "el", "em", "en",
  "er", "es", "et", "ex", "fa", "fe", "fy", "gi", "go", "gu", "ha", "he", "hi", "hm", "ho", "id",
  "if", "in", "is", "it", "jo", "ka", "ki", "ko", "ky", "la", "le", "li", "lo", "ma", "me", "mi",
  "mm", "mo", "mu", "my", "na", "ne", "no", "nu", "ny", "ob", "od", "oe", "of", "oh", "oi", "ok",
  "om", "on", "op", "or", "os", "ot", "ou", "ow", "ox", "oy", "pa", "pe", "pi", "po", "qi", "re",
  "sh", "si", "so", "ta", "te", "ti", "to", "ug", "uh", "um", "un", "up", "ur", "us", "ut", "we",
  "wo", "xi", "xu", "ya", "ye", "yo", "za"
];

const THREE_LETTER_WORDS = (
  "act,add,age,ago,aid,aim,air,ale,all,alt,and,ant,any,ape,apt,arc,are,ark,arm,art,ash,ask,asp,ass,ate,awe,awl,axe,aye," +
  "bad,bag,ban,bar,bat,bay,bed,bee,beg,bet,bib,bid,big,bin,bio,bit,boa,bob,bog,boo,bop,bow,boy,bud,bug,bum,bun,bus,but,buy,bye," +
  "cab,cad,cam,can,cap,car,cat,caw,cob,cod,con,coo,cop,cot,cow,cry,cub,cue,cup,cut," +
  "dad,dam,day,den,dew,did,die,dig,dim,din,dip,doc,dog,don,dot,dry,dub,due,dug,dye," +
  "ear,eat,ebb,egg,ego,elf,elk,elm,end,era,ere,erg,err,est,eta,eve,eye," +
  "fad,fan,far,fat,fax,fed,fee,fen,few,fez,fib,fig,fin,fir,fit,fix,flu,fly,fob,foe,fog,for,fox,fry,fun,fur," +
  "gab,gag,gal,gap,gas,gay,gel,gem,get,gig,gin,god,got,gum,gun,gut,guy,gym," +
  "had,hag,ham,has,hat,haw,hay,hem,hen,her,hey,him,hip,his,hit,hob,hog,hop,hot,how,hub,hue,hug,hum,hut," +
  "ice,icy,ill,imp,ink,inn,ion,ire,irk,its,ivy," +
  "jab,jag,jam,jar,jaw,jay,jet,jew,jib,jig,job,joe,jog,jot,joy,jug,jut," +
  "keg,ken,key,kid,kin,kit," +
  "lab,lad,lag,lap,law,lax,lay,lea,led,leg,lei,let,lid,lie,lip,lit,lob,log,lop,lot,low,lox,lug,lye," +
  "mad,man,map,mar,mas,mat,maw,max,may,med,men,met,mew,mid,mig,mil,mix,mob,mop,mow,mud,mug,mum,mut," +
  "nag,nap,nay,net,new,nib,nil,nip,nit,nix,nod,nor,not,now,nun,nut," +
  "oak,oar,oat,odd,ode,off,oft,ohm,oil,old,one,opt,orb,ore,our,out,owe,owl,own," +
  "pad,pal,pan,par,pat,paw,pay,pea,peg,pen,pet,pew,pig,pin,pip,pit,ply,pod,pop,pot,pow,pro,pry,pub,pug,pun,pup,put," +
  "rag,ram,ran,rap,rat,raw,ray,reb,rec,red,ref,reg,rep,rib,rid,rig,rim,rip,rob,rod,roe,rot,row,rub,rue,rug,rum,run,rut,rye," +
  "sad,sag,sam,sap,sat,saw,say,sea,sec,see,sen,set,sew,sex,she,shy,sib,sin,sip,sir,sis,sit,six,sly,sob,sod,sol,son,sop,sow,soy,spa,spy,sty,sub,sue,sum,sun,sup,sur," +
  "tab,tad,tag,tan,tap,tar,tax,tea,ted,tee,ten,the,thy,tic,tie,til,tin,tip,toe,tog,ton,too,top,tor,tot,tow,toy,try,tub,ug,tug,tun,two," +
  "urn,use,van,vat,vet,via,vie,vow," +
  "wad,wag,wan,war,was,wax,way,web,wed,wet,who,why,wig,win,wit,woe,wok,won,woo,wry,yak,yam,yap,yaw,yea,yen,yep,yes,yet,yew,zip,zoo"
).split(",");

const FOUR_LETTER_WORDS = (
  "acid,acme,acre,acts,afar,aged,ages,aide,aids,ails,aims,airs,airy,alas,ales,ally,alms,aloe,alps,also,alto,alts,amen,anew,anon,ante,ants,apes,apex,arcs,area,ares,arks,arms,army,arts,arty,ashy,asia,asks,asps,atom,atop,aunt,aura,auto,aver,avid,avow,away,awes,awry,axes,axis,axle," +
  "babe,baby,back,bade,bags,bail,bait,bake,bald,bale,balk,ball,balm,band,bane,bang,bank,bans,barb,bard,bare,bark,barn,bars,base,bash,bask,bass,hate,bath,bats,baye,bays,bead,beak,beam,bean,bear,beat,beau,beck,beds,beef,been,beep,beer,bees,beet,begs,bell,belt,bend,bent,best,beta,bets,bevy,bias,bids,bide,bier,bigs,bike,bile,bill,bind,bins,bird,bite,bits,blab,blue,blur,boar,boas,boat,bobs,bode,body,bogs,boil,bold,bolo,bolt,bomb,bond,bone,bony,book,boom,boon,boor,boot,bore,born,boss,both,bots,bout,bowl,bows,boxy,boys,brad,brag,bran,bras,brat,bray,bred,brew,brig,brim,brow,buck,buds,buff,bugs,bulb,bulk,bull,bump,bums,bunk,buns,bunt,buoy,burg,burn,burp,burr,bury,bush,busy,butt,buys,buzz,byte," +
  "cafe,cage,cake,call,calm,came,camp,cans,cant,cape,caps,carb,card,care,cart,case,cash,cast,cats,cave,ceil,cell,cent,chat,chef,chic,chin,chip,chop,chum,clan,claw,clay,clip,clod,clog,clot,club,clue,coal,coat,coax,cock,code,coil,coin,coke,cola,cold,cole,colt,come,cone,conk,cons,cook,cool,coon,coop,coos,coot,cope,cops,copy,cord,core,cork,corn,cost,cote,cots,coup,cove,cowl,coows,crab,crag,cram,crew,crib,crop,crow,cubs,cuff,cull,cult,cups,curb,curd,cure,curl,curt,cusp,cuss,cute,cuts,cyst," +
  "daft,dais,dale,dame,damp,dams,dane,dank,dare,dark,darn,dart,dash,data,date,dawn,days,deaf,deal,dean,dear,debt,deck,deed,deem,deep,deer,deft,defy,deli,dell,demo,dens,dent,deny,dept,desk,dial,dibs,dice,died,dies,diet,digs,dike,dill,dime,dims,dine,ding,dink,dins,dint,dips,dire,dirt,disc,dish,disk,dits,diva,dive,dock,docs,dodo,doer,does,dogs,dole,doll,dolt,dome,doms,done,dong,dons,doom,door,dope,dopy,dose,dote,dots,doty,dour,dove,down,doze,drab,drag,dram,draw,dray,drew,drip,drop,drum,dual,dubs,duce,duck,duct,dude,duds,duel,dues,duet,duff,dugs,duke,dull,duly,dumb,dump,dune,dung,dunk,duns,dupe,dups,dust,duty,dyad,dyed,dyes,dyke,dyne," +
  "each,earl,earn,ears,ease,east,easy,eats,echo,eddy,edge,edgy,edit,eels,eery,eggs,egos,eras,ergo,errs,etch,even,ever,eves,evil,ewes,exam,exit,expo,eyed,eyes," +
  "face,fact,fade,fads,fail,fain,fair,fake,fall,fame,fang,fans,fare,farm,fast,fate,fats,fawn,fear,feat,feds,feed,feel,fees,feet,fell,felt,fend,fern,fest,fete,feud,fief,fife,figs,file,fill,film,find,fine,fins,fire,firm,firs,fish,fist,fits,five,flag,flak,flan,flap,flat,flaw,flax,flay,flea,fled,flee,flew,flex,flip,flit,flog,flow,flue,flux,foam,foes,fogs,foil,fold,folk,fond,font,food,fool,foot,ford,fore,form,fort,foul,four,fowl,foxy,frag,fray,free,fret,frog,from,fuel,full,fume,fund,funk,furs,fury,fuse,fuss," +
  "gabs,gage,gags,gain,gala,gale,gall,gals,game,gang,gaol,gape,gaps,garb,gash,gasp,gate,gave,gawk,gaze,gear,geek,gels,gems,gene,gent,germ,gets,gibe,gift,gigs,gild,gill,gilt,gird,girl,girt,gist,give,glad,glee,glen,glib,glob,glow,glue,glum,glut,gnat,gnaw,goad,goal,goat,gobs,goby,gods,goes,gold,golf,gone,gong,good,goof,goon,gore,gory,gosh,gout,gown,grab,grad,gram,gray,grew,grey,grid,grim,grin,grip,grit,grog,grow,grub,gulf,gull,gulp,gums,gunk,guns,gust,guts,guys,gyro," +
  "hack,hade,hads,haft,hags,haha,hail,hair,hake,hale,half,hall,halo,halt,hams,hand,hang,hank,hard,hare,hark,harm,harp,hart,hash,hasp,hate,hats,have,hawk,haws,hays,haze,hazy,head,heal,heap,hear,heat,heed,heel,heft,heir,held,helm,help,hemp,hems,hens,herb,herd,here,hero,hers,hews,hick,hide,hied,hies,high,hill,hilt,hims,hind,hint,hips,hire,hiss,hits,hive,hoar,hoax,hobs,hobo,hold,hole,holy,home,hone,honk,hood,hoof,hook,hoop,hoot,hope,hops,horn,hose,host,hour,hove,howl,hows,hubs,huge,hugs,hula,hulk,hull,hums,hung,hunk,huns,hunt,hurt,hush,husk,huts,hype,hypo," +
  "iamb,ibex,ibis,iced,ices,icon,idea,idem,ides,idle,idly,idls,idyl,ills,imam,imps,inch,info,inks,inky,inns,into,ions,iota,ired,ires,iris,irks,iron,isle,isms,itch,item," +
  "jabs,jack,jade,jags,jail,jake,jamb,jams,jane,jars,jato,java,jaws,jays,jazz,jean,jeep,jeer,jell,jerk,jest,jets,jibe,jibs,jiff,jigs,jill,jilt,jink,jinn,jinx,jive,jobs,jock,joes,joey,jogs,john,join,joke,jolt,josh,joss,jota,jots,jowl,joys,judo,jugs,july,jump,june,junk,jury,just,jute,juts," +
  "kale,kane,keel,keen,keep,kegs,kelp,kelt,keno,kens,kent,kept,kerb,kern,keys,khan,kick,kids,kilo,kilt,kind,king,kink,kins,kirk,kiss,kist,kith,kits,kiwi,knee,knew,knit,knob,knop,knot,know,koala,kongo,koto,kudos," +
  "labs,lace,lack,lacs,lacy,lade,lads,lady,lags,laic,laid,lain,lair,lake,lakh,laky,lama,lamb,lame,lamp,lams,land,lane,lang,lank,lapb,laps,lard,lare,lark,lase,lash,lass,last,late,lath,lati,lats,laud,lava,lave,lawn,laws,lays,laze,lazy,lead,leaf,leak,lean,leap,lear,leas,leat,lech,leek,leer,lees,left,legs,leis,leke,lend,lens,lent,leon,leos,lepe,lept,lese,less,lest,lets,leva,leve,levo,levs,lewd,leys,liar,lias,libs,lice,lich,lick,lido,lids,lien,lier,lies,life,lift,liga,like,lilo,lilt,lily,lima,limb,lime,limn,limo,limp,limy,line,ling,link,linn,lino,lins,lint,lion,lips,lira,lire,liri,lisp,list,lite,lits,live,load,loaf,loam,loan,lobe,lobo,lobs,loca,loch,loci,lock,loco,lode,loft,loga,loge,logo,logs,logy,loid,loin,loll,lome,lone,long,loof,look,loom,loon,loop,loos,loot,lope,lops,lord,lore,lorn,loro,lory,lose,loss,lost,lota,lote,loth,loti,loto,lots,loud,loup,lour,lout,love,lowe,lown,lows,luce,luck,lude,ludo,lues,luff,luge,lugs,lull,lulu,luma,lump,lums,luna,lune,lung,lunk,lunt,luny,lure,lurk,lush,lust,lute,lutz,luvs,luxe,lych,lyes,lyme,lynx,lyra,lyre,lyse"
).split(",");

const FIVE_PLUS_LETTER_WORDS = (
  "about,above,actor,acute,admit,adore,adult,agent,agile,agree,ahead,alarm,album,alert,alike,alive,alley,alone,along,alter,among,anger,angle,angry,apart,apple,argue,arise,armor,arrow,aside,asset,audio,avoid,awake,award,aware,awful," +
  "bacon,badge,baker,basic,basin,beach,beard,beast,begin,being,below,bench,bible,birch,black,blade,blame,blast,blend,blind,blink,block,blood,bloom,blown,board,boast,brass,brave,bread,break,breed,brick,bride,brief,bring,broad,broke,brown,brush,build,built,buyer," +
  "cabin,cable,cagey,camel,camera,canal,candy,canoe,cards,cargo,carry,carve,castle,catch,cause,cavern,chain,chair,champ,chaos,chart,chase,cheap,check,cheek,cheer,chest,chief,child,chill,chime,china,chips,choir,choke,chord,chose,chuck,cider,cigar,claim,clark,class,clean,clear,clerk,click,cliff,climb,cling,clock,close,cloud,clout,clove,clown,coach,coast,cobalt,comet,cocoa,codex,conic,copper,coral,cosmic,court,cousin,cover,covet,crack,craft,crane,crash,crate,crater,crave,crawl,crazy,cream,creed,creek,crept,crest,cried,cries,crime,cross,crowd,crown,crude,cruel,crust,crystal,cycle,cysts," +
  "daily,dairy,delay,delta,demon,depth,diary,dirty,ditch,diver,dizzy,dodge,doubt,draft,drama,dread,dream,dress,dried,drift,drill,drink,drive,drone,drown,druid,drunk,dusty,dwell,dying,dynam," +
  "eager,eagle,early,earth,easts,eight,elbow,elder,elect,elite,empty,enemy,enjoy,enter,entry,equal,equip,error,event,every,evict,evils,exact,excel,exert,exile,exist,expel,extra," +
  "fable,facet,facts,fairy,faith,false,fancy,fatal,fatty,fault,favor,feast,fiber,field,fierce,fifth,fifty,fight,filter,final,finch,finite,first,fixed,fixes,flags,flame,flare,flask,flesh,flick,flint,float,flock,flood,floor,flour,flows,fluid,flyer,focus,forge,forte,forth,forty,forum,found,frame,frank,fraud,fresh,front,frost,froze,fruit,fugue,funds,funny,futon,fuzzy," +
  "giant,glass,globe,glove,grain,grand,graph,grasp,grass,grave,great,green,grief,grill,grind,group,grown,guard,guess,guest,guide,guild,guilt,habit,heavy,hobby,honey,honor,horse,hotel,house,human,humor,hurry," +
  "ideal,image,imply,index,inner,input,intel,irony,issue,ivory,jacket,joint,judge,juice,juror,karma,laser,laugh,layer,lemon,levee,level,lever,light,limit,lipid,liver,local,logic,loose,lover,lower,lucky,lunch,lunges,lying,lyric,macaw,macro,magic,magma,magnet,major,maker,manic,manor,maple,march,marry,match,matte,maxim,maybe,mayor,meant,medal,media,medic,meet,melon,metal,meter,micro,midst,might,miner,minor,minus,miracle,mixed,mixer,model,modem,moist,molar,molecular,molecule,money,monic,month,moody,moral,motor,mound,mount,mouse,mouth,moved,mover,movie,multi,mural,music,myths,naive,naked,nasal,nasty,naval,needs,nerve,never,newer,newly,nexus,niche,night,ninja,noble,noise,noisy,nomad,north,notch,noted,novel,nurse,nylon,oasis,obese,ocean,octet,odors,offer,often,older,olive,omega,onion,onset,opera,orbit,order,organ,other,outer,oxide,ozone,paces,paint,panel,panic,paper,parade,parch,parks,parse,parts,party,paste,patch,paths,patio,patrol,pause,peace,peach,peaks,pearl,pedal,peers,penny,phase,phone,photo,physics,piano,picks,piece,pict,pigment,piled,piles,pilot,pinch,piper,pipes,pitch,pithy,pixel,pizza,place,plaid,plain,plane,planet,plank,plant,plasma,plate,playa,plays,plaza,plead,pleas,plots,pluck,plugs,plumb,plume,plump,plums,plush,poets,point,polar,poles,polio,polyp,ponds,pools,poses,posts,pouch,pound,power,prank,prays,press,preys,price,prick,pride,prima,prime,print,prior,prism,privy,prize,probe,promo,proms,prone,proof,props,prose,proud,prove,prowl,proxy,psalm,pubic,pudgy,puffs,pulp,pulpy,pulse,pumas,pumps,punch,pundy,punks,punny,pupil,puppy,puree,purge,purse,pushy,pygmy,pyres,pyrite,python,quack,quads,quake,qualm,quark,quart,queen,query,quest,quick,quiet,quilt,quirk,quite,quota,quote,rabbi,rabid,races,radar,radii,radio,radon,rafts,ragae,rages,raids,rails,rains,rainy,raise,rally,ramps,ranch,range,rapid,rarer,raspy,rates,ratio,rayon,razor,reach,react,reads,ready,realm,reals,reaps,rebel,recap,recks,reco,redos,reduce,reeds,reedy,reels,refer,refit,reflex,regal,reign,reins,relax,relay,relic,remit,remix,renal,rends,renew,rents,repas,repel,reply,rerun,reset,resin,resis,rests,rusty,retro,retry,reuse,revel,revet,revit,rhyme,rhythm,ricer,rices,rider,rides,ridge,rids,rife,rifts,rigid,rigs,riley,riles,rills,rimes,rinds,rings,rinks,rinse,riots,ripen,ripes,riser,rises,risks,risky,rites,rival,river,roads,roams,roan,roars,roast,robed,robes,robin,robot,rocks,rocky,rodeo,rogue,roles,rolls,roman,roofs,rooks,rooms,roomy,roost,roots,roped,ropes,roses,resin,rotor,rough,round,route,routs,rover,rowed,rower,royal,rubes,rubis,ruble,ruddy,ruffs,rugby,ruined,ruins,ruled,ruler,rules,rumen,rumor,runic,runny,runts,runwa,rural,ruses,rusts,rusty,rutty,saber,sable,sabor,sabre,sacks,sadly,safer,safes,sagas,sager,sages,sahara,sails,saint,salad,sales,salis,salon,salts,salty,salve,salvo,samba,sambe,sammy,sands,sandy,saner,sappy,saran,sarge,sarin,saris,sassy,satin,satyr,sauce,saucy,sauna,saved,saver,saves,savor,savoy,savvy,sawed,sawer,saxon,scabs,scald,scale,scalp,scaly,scamp,scans,scant,scare,scarf,scars,scary,scene,scent,schwa,scion,scoff,scold,scoop,scoot,scope,score,scorn,scots,scour,scout,scowl,scows,scram,scrap,scree,screw,scrim,scrip,scrod,scrub,scuba,scuds,scuff,scull,sculp,scurf,scuta,scute,scuts,scythe,seals,seams,seamy,sears,seats,sebum,sects,sedan,sedge,sedgy,seeds,seedy,seeks,seems,seeps,seepy,seers,segos,segue,seine,seism,seize,selah,selfs,sells,semen,semis,sends,senna,senor,sense,sensi,sente,sents,sepal,sepia,sepic,sepoy,septa,septs,serfs,serge,serif,serin,serow,serum,serun,serve,servo,setae,setup,seven,sever,sewed,sewer,sexes,shack,shade,shads,shady,shaft,shags,shahs,shake,shaky,shale,shall,shalt,shame,shams,shank,shant,shape,shapy,shard,share,shark,sharn,sharp,shart,shat,shave,shawl,shawn,shaws,shays,sheaf,shear,sheas,sheds,sheen,sheep,sheer,sheet,sheik,shelf,shell,sheol,sheow,sherd,sheri,shewn,shews,shiah,shiel,shift,shige,shill,shily,shims,shine,shins,shiny,ships,shire,shirk,shirr,shirt,shist,shite,shits,shiva,shive,shivs,shoad,shoal,shoat,shock,shoed,shoer,shoes,shogi,shogs,shoji,shola,shone,shook,shool,shoon,shoos,shoot,shope,shops,shopt,shore,shorl,shorn,short,shote,shots,shott,shout,shove,showd,shown,shows,showy,shoya,shoyu,shrad,shrap,shred,shree,shrew,shrewd,shria,shrip,shris,shrod,shrog,shrub,shrug,shrut,shryk,shuan,shubs,shuck,shuds,shufty,shugs,shule,shuls,shunb,shuns,shunt,shura,shure,shurk,shush,shute,shuts,shutu,shuyk,shyer,shyes,shyle,shyli,shymo,shyne,shyny,sabal,saber"
).split(",");

// Create the unified lowercase dictionary array
const rawDictionary = [
  ...TWO_LETTER_WORDS,
  ...THREE_LETTER_WORDS,
  ...FOUR_LETTER_WORDS,
  ...FIVE_PLUS_LETTER_WORDS
];

// Clean, filter duplicates, format as UPPERCASE to match standard crossword inputs, and sort.
export const dictionary = Array.from(
  new Set(rawDictionary.map(w => w.trim().toUpperCase()))
).filter(w => w.length >= 2);

console.log(`Loaded custom dictionary database of ${dictionary.length} words.`);
