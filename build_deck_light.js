const pptxgen = require('pptxgenjs');
const { icon } = require('@fortawesome/fontawesome-svg-core');
const {
  faScaleBalanced, faShieldHalved, faWallet, faUser, faStore, faGlobe,
  faArrowRight, faArrowDown, faCircleCheck, faTriangleExclamation,
  faBriefcase, faMessage, faLock, faFileCircleCheck, faMagnifyingGlass,
  faGavel, faRotateLeft, faLink, faCoins, faCode, faNetworkWired,
  faChartLine, faHandshake, faClock, faFingerprint, faBuilding,
  faBox, faBolt, faUsers, faLaptopCode, faArrowTrendUp, faRocket,
  faCheck, faXmark, faFileShield, faSackDollar, faLandmark,
  faHeadset, faListCheck, faShield, faMoneyBillTransfer,
  faFileInvoice, faArrowRightArrowLeft, faClipboardCheck, faKey,
  faMagnifyingGlassChart, faGlobeAmericas, faCircleNodes, faHandHoldingDollar
} = require('@fortawesome/free-solid-svg-icons');
const path = require('path');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'TRUSETT';
pptx.subject = 'Hedera-powered payment protection protocol';
pptx.title = 'TRUSETT | Trust meets settlement';
pptx.company = 'TRUSETT';
pptx.lang = 'en-US';
pptx.theme = { headFontFace: 'Inter', bodyFontFace: 'Inter', lang: 'en-US' };

const W = 13.333, H = 7.5;
const C = {
  bg: 'F4F0E5', paper: 'FFFEF8', paper2: 'F9F7EF', ink: '1C3028', forest: '174B3A',
  green: '2F6B4F', green2: '3E805E', lime: 'C6DF78', lime2: 'DCE9AE', sage: 'DCE6D8',
  sage2: 'E8EEE3', line: 'CCD5C9', muted: '607267', dim: '87958B', white: 'FFFFFF',
  clay: 'C76D54', clayLite: 'F2DFD7', blue: '537D78', blueLite: 'DCE9E5',
  gold: 'B18A43', goldLite: 'EFE5CF', black: '10251C'
};
const FONT = 'Inter';

function rect(s,x,y,w,h,fill,opts={}) {
  s.addShape(pptx.ShapeType.rect, {x,y,w,h,fill:{color:fill,transparency:opts.transparency||0},line:{color:opts.line||fill,transparency:opts.lineTransparency===undefined?100:opts.lineTransparency,width:opts.lineWidth||0.7}, ...(opts.rotate?{rotate:opts.rotate}:{})});
}
function ln(s,x1,y1,x2,y2,color=C.line,width=1,dash='solid') {
  s.addShape(pptx.ShapeType.line,{x:x1,y:y1,w:x2-x1,h:y2-y1,line:{color,width,dashType:dash,beginArrowType:'none',endArrowType:'none'}});
}
function tx(s,text,x,y,w,h,size=12,color=C.ink,bold=false,opts={}) {
  s.addText(text,{x,y,w,h,fontFace:opts.fontFace||FONT,fontSize:size,color,bold,margin:opts.margin===undefined?0:opts.margin,fit:'shrink',valign:opts.valign||'mid',align:opts.align||'left',breakLine:false,paraSpaceAfterPt:0,wrap:true,charSpacing:opts.charSpacing||0,italic:opts.italic||false,transparency:opts.transparency||0,underline:opts.underline||false,rotate:opts.rotate||0});
}
function rich(s,runs,x,y,w,h,size=12,opts={}) {
  s.addText(runs,{x,y,w,h,fontFace:FONT,fontSize:size,margin:0,fit:'shrink',valign:opts.valign||'mid',align:opts.align||'left',breakLine:false,paraSpaceAfterPt:0,wrap:true});
}
function faData(def,color='1C3028') {
  let svg = icon(def).html.join('');
  svg = svg.replace(/fill="currentColor"/g,`fill="#${color}"`).replace('<svg ','<svg width="512" height="512" ');
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}
function ic(s,def,x,y,w,h,color=C.ink) { s.addImage({data:faData(def,color),x,y,w,h}); }
function blockLabel(s,label,x,y,w,fill=C.forest,color=C.white) {
  rect(s,x,y,w,0.28,fill);
  tx(s,label,x+0.1,y+0.015,w-0.2,0.23,7.3,color,true,{charSpacing:1.0});
}
function squareIcon(s,def,x,y,size,fill=C.sage,iconColor=C.forest) {
  rect(s,x,y,size,size,fill,{line:C.line,lineTransparency:0,lineWidth:0.65});
  ic(s,def,x+size*0.25,y+size*0.25,size*0.5,size*0.5,iconColor);
}
function brandMark(s,x,y,size=0.55,dark=false) {
  const bg = dark ? C.lime : C.forest;
  const fg = dark ? C.forest : C.lime;
  rect(s,x,y,size,size,bg);
  // abstract balance / shield mark from editable vector strokes
  ln(s,x+size*0.2,y+size*0.32,x+size*0.8,y+size*0.32,fg,1.7);
  ln(s,x+size*0.5,y+size*0.18,x+size*0.5,y+size*0.77,fg,1.7);
  ln(s,x+size*0.33,y+size*0.32,x+size*0.23,y+size*0.57,fg,1.35);
  ln(s,x+size*0.67,y+size*0.32,x+size*0.77,y+size*0.57,fg,1.35);
  ln(s,x+size*0.15,y+size*0.58,x+size*0.34,y+size*0.58,fg,1.35);
  ln(s,x+size*0.66,y+size*0.58,x+size*0.85,y+size*0.58,fg,1.35);
  ln(s,x+size*0.33,y+size*0.78,x+size*0.67,y+size*0.78,fg,1.35);
}
function header(s,n,kicker,title,subtitle='') {
  tx(s,String(n).padStart(2,'0'),0.62,0.35,0.36,0.24,9,C.green,true,{charSpacing:0.8});
  tx(s,kicker.toUpperCase(),1.05,0.35,4.6,0.24,8,C.muted,true,{charSpacing:1.5});
  tx(s,'TRUSETT',11.45,0.34,1.2,0.24,9,C.forest,true,{align:'right',charSpacing:1.1});
  tx(s,title,0.65,0.77,11.9,0.56,27,C.ink,true,{fontFace:'Inter'});
  if (subtitle) tx(s,subtitle,0.67,1.38,11.9,0.28,10.4,C.muted,false);
  ln(s,0.65,1.83,12.68,1.83,C.line,0.8);
}
function footer(s,n) {
  ln(s,0.65,7.08,12.68,7.08,C.line,0.65);
  tx(s,'TRUSETT  /  HEDERA CROSS CAMPUS CHALLENGE 2026',0.67,7.16,6.3,0.16,6.8,C.dim,true,{charSpacing:0.75});
  tx(s,`${String(n).padStart(2,'0')}  /  07`,11.9,7.14,0.76,0.18,7.2,C.muted,true,{align:'right',charSpacing:0.5});
}
function bg(s,variant='paper') {
  const col = variant==='white' ? C.paper : C.bg;
  rect(s,0,0,W,H,col);
  // graphic grid / corner blocks, subtle and square-edged
  rect(s,12.88,0,0.45,0.12,C.lime);
  rect(s,0,7.36,0.52,0.14,C.forest);
}
function panel(s,x,y,w,h,fill=C.paper,edge=C.line) {
  rect(s,x,y,w,h,fill,{line:edge,lineTransparency:0,lineWidth:0.75});
}
function dot(s,x,y,color=C.green,size=0.07) {
  s.addShape(pptx.ShapeType.ellipse,{x,y,w:size,h:size,fill:{color},line:{color,transparency:100}});
}
function arrow(s,x1,y1,x2,y2,color=C.green,width=1.5) {
  s.addShape(pptx.ShapeType.line,{x:x1,y:y1,w:x2-x1,h:y2-y1,line:{color,width,beginArrowType:'none',endArrowType:'triangle'}});
}

// SLIDE 1 — INTRODUCTION
{
  const s = pptx.addSlide(); bg(s);
  rect(s,0,0,0.18,H,C.forest);
  tx(s,'HEDERA CROSS CAMPUS CHALLENGE  /  INPT CAMPUS EDITION',0.78,0.54,6.3,0.25,8,C.green,true,{charSpacing:1.45});
  tx(s,'01',11.95,0.53,0.72,0.25,8,C.muted,true,{align:'right',charSpacing:1.1});
  brandMark(s,0.8,1.48,0.76,false);
  rich(s,[{text:'TRU',options:{bold:true,color:C.ink}},{text:'SETT',options:{bold:true,color:C.green}}],1.78,1.39,5.65,0.94,51);
  tx(s,'Trust meets settlement.',1.82,2.46,5.9,0.46,23,C.forest,true);
  tx(s,'The protection layer for irreversible payments.',1.84,3.08,5.5,0.35,13,C.muted,false);
  rect(s,1.82,3.78,0.78,0.08,C.lime);
  tx(s,'Programmable USDC escrow  /  AI-assisted dispute review  /  Verifiable settlement',1.82,4.05,5.65,0.65,11,C.ink,false);
  blockLabel(s,'PAYMENTS WITH RULES',1.82,5.18,1.85,C.forest,C.white);
  blockLabel(s,'FAIR DISPUTE FLOW',3.81,5.18,1.8,C.lime,C.forest);
  blockLabel(s,'HEDERA-NATIVE',5.75,5.18,1.42,C.sage,C.forest);
  tx(s,'Team: [Team name]   •   Presenters: [Names]',1.84,6.23,5.2,0.24,8.5,C.muted,false);
  // right side architectural composition
  rect(s,8.03,1.05,4.52,5.58,C.forest);
  rect(s,8.28,1.31,4.02,5.06,C.paper2);
  // block mosaic header
  rect(s,8.28,1.31,1.1,0.32,C.lime);
  rect(s,9.38,1.31,0.56,0.32,C.sage);
  rect(s,9.94,1.31,1.22,0.32,C.green2);
  rect(s,11.16,1.31,1.14,0.32,C.lime2);
  tx(s,'A MORE TRUSTED PAYMENT',8.62,1.88,3.32,0.24,8,C.green,true,{charSpacing:1.2});
  brandMark(s,9.77,2.34,1.02,true);
  tx(s,'ESCROW',9.05,3.58,2.5,0.25,9,C.forest,true,{align:'center',charSpacing:1.6});
  tx(s,'200 USDC',8.92,3.91,2.78,0.52,28,C.ink,true,{align:'center'});
  tx(s,'HELD UNTIL THE TERMS ARE MET',8.73,4.52,3.2,0.22,7.5,C.muted,true,{align:'center',charSpacing:0.9});
  // three stage blocks
  rect(s,8.56,5.13,0.94,0.77,C.sage);
  rect(s,9.62,5.13,0.94,0.77,C.lime);
  rect(s,10.68,5.13,1.29,0.77,C.green);
  tx(s,'BUYER',8.62,5.34,0.82,0.22,8,C.forest,true,{align:'center'});
  tx(s,'LOCKED',9.68,5.34,0.82,0.22,8,C.forest,true,{align:'center'});
  tx(s,'SETTLED',10.77,5.34,1.11,0.22,8,C.white,true,{align:'center'});
  tx(s,'A protected transaction path',8.52,6.12,3.55,0.2,8,C.muted,false,{align:'center'});
  // corner markers
  rect(s,12.24,1.05,0.31,0.31,C.lime);
  rect(s,7.72,6.32,0.31,0.31,C.lime);
}

// SLIDE 2 — PROBLEM
{
  const s = pptx.addSlide(); bg(s); header(s,2,'The problem','Payments settle. Trust doesn’t.','Direct wallet transfers can be final before either party knows whether the other will fulfil the agreement.');
  // Transaction rail on left
  panel(s,0.72,2.16,7.25,3.76,C.paper);
  blockLabel(s,'THE UNPROTECTED PATH',1.02,2.43,2.18,C.clay,C.white);
  const nodes=[
    {x:1.18,fill:C.sage,icon:faUser,ic:C.forest,name:'BUYER',sub:'sends payment'},
    {x:2.85,fill:C.sage2,icon:faCoins,ic:C.green,name:'200 USDC',sub:'transfer settles'},
    {x:4.56,fill:C.goldLite,icon:faUser,ic:C.gold,name:'UNKNOWN',sub:'counterparty'},
    {x:6.22,fill:C.clayLite,icon:faXmark,ic:C.clay,name:'NO DELIVERY',sub:'no auto-refund'}
  ];
  nodes.forEach((n,i)=>{
    rect(s,n.x,3.26,1.14,1.08,n.fill,{line:C.line,lineTransparency:0});
    ic(s,n.icon,n.x+0.37,3.48,0.4,0.4,n.ic);
    tx(s,n.name,n.x-0.08,4.48,1.3,0.22,8,C.ink,true,{align:'center'});
    tx(s,n.sub,n.x-0.08,4.75,1.3,0.25,7.3,C.muted,false,{align:'center'});
    if(i<3) arrow(s,n.x+1.19,3.8,n.x+1.57,3.8,i===2?C.clay:C.green,1.5);
  });
  rect(s,1.02,5.34,6.65,0.35,C.clayLite);
  tx(s,'The transfer is complete. The dispute process is missing.',1.18,5.39,6.3,0.22,8.4,C.clay,true,{align:'center'});
  // right-hand dual risk cards
  panel(s,8.25,2.16,4.36,1.73,C.sage);
  squareIcon(s,faUser,8.55,2.48,0.62,C.paper,C.forest);
  tx(s,'BUYER RISK',9.38,2.43,2.35,0.22,8,C.green,true,{charSpacing:1.15});
  tx(s,'Pays first. May receive nothing.',9.38,2.79,2.82,0.45,13,C.ink,true);
  panel(s,8.25,4.13,4.36,1.79,C.goldLite);
  squareIcon(s,faBriefcase,8.55,4.48,0.62,C.paper,C.gold);
  tx(s,'SELLER RISK',9.38,4.42,2.35,0.22,8,C.gold,true,{charSpacing:1.15});
  tx(s,'Delivers work. May not get paid.',9.38,4.78,2.82,0.5,13,C.ink,true);
  // bottom truth strip
  rect(s,0.72,6.22,11.89,0.47,C.forest);
  tx(s,'TRUSETT protects only payments made through its escrow flow; it cannot reverse arbitrary completed wallet transfers.',0.98,6.31,11.35,0.23,8.3,C.white,true,{align:'center'});
  footer(s,2);
}

// SLIDE 3 — OPPORTUNITY
{
  const s = pptx.addSlide(); bg(s); header(s,3,'The opportunity','Start where both sides need proof.','A focused first market makes delivery terms, evidence and payment milestones easier to define.');
  // left: four customer square tiles
  tx(s,'POTENTIAL EARLY USERS',0.75,2.08,3.4,0.22,8,C.green,true,{charSpacing:1.25});
  const items=[
    [faLaptopCode,'FREELANCERS','Milestone work and direct client payments',C.sage,C.forest],
    [faBuilding,'SMALL AGENCIES','Cross-border projects and service contracts',C.lime2,C.green],
    [faStore,'SOCIAL SELLERS','Commerce arranged through DMs and links',C.blueLite,C.blue],
    [faUsers,'P2P SERVICES','Digital goods and one-to-one transactions',C.goldLite,C.gold]
  ];
  const positions=[[0.75,2.47],[3.74,2.47],[0.75,4.08],[3.74,4.08]];
  items.forEach((it,i)=>{
    const [x,y]=positions[i];
    panel(s,x,y,2.72,1.35,C.paper);
    rect(s,x,y,0.13,1.35,it[3]);
    squareIcon(s,it[0],x+0.25,y+0.27,0.62,it[3],it[4]);
    tx(s,it[1],x+1.02,y+0.25,1.52,0.22,8,C.forest,true,{charSpacing:0.7});
    tx(s,it[2],x+1.02,y+0.57,1.47,0.56,8.3,C.muted,false);
  });
  // right beachhead panel
  rect(s,6.84,2.08,5.74,3.35,C.forest);
  blockLabel(s,'FIRST WEDGE',7.18,2.41,1.42,C.lime,C.forest);
  tx(s,'Freelancers +\nsmall digital agencies',7.18,2.89,4.82,0.91,24,C.white,true);
  tx(s,'Accepting USDC for cross-border, milestone-based services.',7.2,3.95,4.65,0.45,10.5,'E1EADF',false);
  ln(s,7.18,4.58,12.16,4.58,'527864',0.8);
  const why=['Deliverables can be specified','Milestones create clear release points','Both parties have money at risk'];
  why.forEach((t,i)=>{
    dot(s,7.2,4.82+i*0.19,C.lime,0.075);
    tx(s,t,7.4,4.77+i*0.19,4.5,0.19,7.6,C.white,false);
  });
  // bottom validation strip
  rect(s,0.75,5.82,11.83,0.82,C.lime2);
  tx(s,'VALIDATE BEFORE SCALING',1.02,6.03,2.15,0.2,8,C.forest,true,{charSpacing:0.8});
  tx(s,'10–15',3.48,5.94,0.8,0.34,18,C.forest,true);
  tx(s,'customer interviews',4.3,6.02,1.65,0.22,8,C.ink,false);
  tx(s,'3–5',6.16,5.94,0.62,0.34,18,C.forest,true);
  tx(s,'pilot merchants',6.82,6.02,1.36,0.22,8,C.ink,false);
  tx(s,'WTP',8.52,5.94,0.82,0.34,18,C.forest,true);
  tx(s,'test fee acceptance',9.36,6.02,2.2,0.22,8,C.ink,false);
  footer(s,3);
}

// SLIDE 4 — PRODUCT / WORKFLOW
{
  const s = pptx.addSlide(); bg(s); header(s,4,'The product','One protected payment. Clear rules at every step.','TRUSETT turns an informal buyer–seller agreement into a payment with pre-agreed release and dispute conditions.');
  // Left app-like payment pass
  rect(s,0.72,2.12,3.52,4.62,C.forest);
  rect(s,0.92,2.32,3.12,4.22,C.paper);
  rect(s,0.92,2.32,3.12,0.52,C.lime);
  tx(s,'TRUSETT  /  PAYMENT REQUEST',1.12,2.47,2.7,0.2,8,C.forest,true,{charSpacing:0.85});
  tx(s,'WEBSITE DESIGN',1.18,3.08,2.55,0.21,8,C.green,true,{charSpacing:1.0});
  tx(s,'Milestone 01',1.18,3.38,2.55,0.34,16,C.ink,true);
  tx(s,'Landing page + responsive layout',1.18,3.78,2.5,0.35,8.5,C.muted,false);
  ln(s,1.18,4.27,3.78,4.27,C.line,0.75);
  tx(s,'PAYMENT AMOUNT',1.18,4.52,2.3,0.19,7.5,C.muted,true,{charSpacing:0.8});
  tx(s,'200',1.18,4.83,1.25,0.56,31,C.ink,true);
  tx(s,'USDC',2.39,5.03,0.8,0.24,11,C.green,true);
  rect(s,1.18,5.55,2.56,0.43,C.sage);
  ic(s,faLock,1.34,5.66,0.18,0.18,C.forest);
  tx(s,'HELD IN ESCROW',1.64,5.63,1.83,0.22,8,C.forest,true,{charSpacing:0.65});
  tx(s,'Buyer approves or opens a dispute',1.18,6.17,2.56,0.22,7.5,C.muted,false);
  // right side horizontal flow with square cards
  tx(s,'THE PROTECTED PAYMENT LIFECYCLE',4.62,2.17,5.7,0.22,8,C.green,true,{charSpacing:1.2});
  const steps=[
    [faLink,'01','CREATE','Seller shares a protected link',C.sage,C.forest],
    [faCoins,'02','DEPOSIT','Buyer locks USDC in escrow',C.lime2,C.green],
    [faBox,'03','DELIVER','Seller completes agreed work',C.blueLite,C.blue],
    [faScaleBalanced,'04','RESOLVE','Evidence + authorized arbiter',C.goldLite,C.gold],
    [faArrowRightArrowLeft,'05','SETTLE','Release, refund or split',C.sage,C.forest]
  ];
  const sx=4.62, sw=1.48, sg=0.12, sy=2.62;
  steps.forEach((st,i)=>{
    const x=sx+i*(sw+sg);
    rect(s,x,sy,sw,2.2,C.paper,{line:C.line,lineTransparency:0,lineWidth:0.7});
    rect(s,x,sy,sw,0.14,st[4]);
    tx(s,st[1],x+0.12,sy+0.24,0.35,0.18,7.5,C.muted,true,{charSpacing:0.6});
    squareIcon(s,st[0],x+0.39,sy+0.58,0.68,st[4],st[5]);
    tx(s,st[2],x+0.12,sy+1.4,sw-0.24,0.22,8,C.forest,true,{align:'center',charSpacing:0.7});
    tx(s,st[3],x+0.12,sy+1.7,sw-0.24,0.38,7.1,C.muted,false,{align:'center'});
    if(i<4) arrow(s,x+sw+0.015,sy+1.11,x+sw+sg-0.012,sy+1.11,C.green,1.1);
  });
  // outcome lanes
  rect(s,4.62,5.14,3.76,0.91,C.sage);
  squareIcon(s,faCircleCheck,4.82,5.32,0.5,C.paper,C.forest);
  tx(s,'NO DISPUTE',5.48,5.28,1.35,0.19,8,C.forest,true,{charSpacing:0.7});
  tx(s,'Release under agreed terms',5.48,5.56,2.55,0.22,8,C.ink,false);
  rect(s,8.56,5.14,3.76,0.91,C.clayLite);
  squareIcon(s,faGavel,8.76,5.32,0.5,C.paper,C.clay);
  tx(s,'DISPUTE OPENED',9.42,5.28,1.65,0.19,8,C.clay,true,{charSpacing:0.55});
  tx(s,'Review, ruling, then settlement',9.42,5.56,2.55,0.22,8,C.ink,false);
  rect(s,4.62,6.23,7.7,0.39,C.forest);
  tx(s,'AI recommends. An authorized arbiter decides. The contract executes.',4.83,6.29,7.25,0.22,8.2,C.white,true,{align:'center'});
  footer(s,4);
}

// SLIDE 5 — HEDERA ARCHITECTURE
{
  const s = pptx.addSlide(); bg(s); header(s,5,'Technology & Hedera','Three Hedera services. One governed settlement.','TRUSETT separates private evidence review from public, programmable fund movement.');
  // swimlane labels
  blockLabel(s,'OFF-CHAIN EXPERIENCE',0.75,2.12,2.18,C.green,C.white);
  blockLabel(s,'HEDERA EXECUTION',5.08,2.12,2.08,C.forest,C.white);
  blockLabel(s,'AUDIT + READ MODEL',9.32,2.12,2.45,C.lime,C.forest);
  // left app / AI blocks
  panel(s,0.75,2.56,3.7,2.42,C.paper);
  squareIcon(s,faLaptopCode,1.02,2.88,0.58,C.sage,C.forest);
  tx(s,'TRUSETT APP + API',1.8,2.86,2.2,0.22,9,C.forest,true,{charSpacing:0.75});
  tx(s,'Buyer / seller payment links, approvals, dispute UI',1.8,3.16,2.25,0.47,8.2,C.muted,false);
  ln(s,1.02,3.83,4.16,3.83,C.line,0.7);
  squareIcon(s,faMagnifyingGlassChart,1.02,4.09,0.58,C.goldLite,C.gold);
  tx(s,'AI + HUMAN REVIEW',1.8,4.07,2.15,0.22,9,C.ink,true,{charSpacing:0.7});
  tx(s,'Private evidence → recommendation → authorized ruling',1.8,4.37,2.26,0.42,8,C.muted,false);
  // central hedera execution panel
  rect(s,5.08,2.56,3.66,2.42,C.forest);
  brandMark(s,5.36,2.86,0.58,true);
  tx(s,'TRUSETT ESCROW CONTRACT',6.13,2.84,2.22,0.22,8.8,C.white,true,{charSpacing:0.45});
  tx(s,'State machine + permissioned outcomes',6.13,3.15,2.18,0.35,7.7,'E2EADF',false);
  ln(s,5.35,3.72,8.46,3.72,'527864',0.75);
  // three service chips
  const services=[
    {x:5.35,icon:faCode,name:'HSCS',desc:'Escrow rules',color:C.lime},
    {x:6.43,icon:faCoins,name:'HTS',desc:'USDC movement',color:'BBD7C2'},
    {x:7.51,icon:faNetworkWired,name:'HCS',desc:'Event records',color:'E0D7A7'}
  ];
  services.forEach(v=>{
    rect(s,v.x,3.96,0.94,0.77,'225B45',{line:'5D8A70',lineTransparency:0});
    ic(s,v.icon,v.x+0.34,4.08,0.26,0.26,v.color);
    tx(s,v.name,v.x+0.08,4.39,0.78,0.16,8,C.white,true,{align:'center'});
    tx(s,v.desc,v.x-0.01,4.59,0.96,0.12,5.9,'D7E6D9',false,{align:'center'});
  });
  // right audit/read model
  panel(s,9.32,2.56,3.26,2.42,C.paper);
  squareIcon(s,faFileCircleCheck,9.6,2.87,0.58,C.lime2,C.forest);
  tx(s,'AUDITABLE EVENTS',10.36,2.86,1.9,0.22,9,C.forest,true,{charSpacing:0.65});
  tx(s,'HCS topic records event references and timestamps.',10.36,3.16,1.92,0.43,7.7,C.muted,false);
  ln(s,9.6,3.83,12.3,3.83,C.line,0.7);
  squareIcon(s,faMagnifyingGlass,9.6,4.09,0.58,C.sage,C.green);
  tx(s,'MIRROR NODE',10.36,4.07,1.85,0.22,9,C.ink,true,{charSpacing:0.65});
  tx(s,'Read / index on-chain state for the interface.',10.36,4.37,1.9,0.4,7.7,C.muted,false);
  // connections
  arrow(s,4.48,3.77,5.0,3.77,C.green,1.8);
  arrow(s,8.77,3.77,9.24,3.77,C.green,1.8);
  // bottom principles
  rect(s,0.75,5.29,11.83,0.95,C.lime2);
  tx(s,'PRIVATE BY DEFAULT',1.02,5.48,2.12,0.19,8,C.forest,true,{charSpacing:0.8});
  tx(s,'Evidence stays off-chain.',1.02,5.78,2.4,0.2,7.6,C.ink,false);
  ln(s,3.88,5.46,3.88,6.06,'B7C99C',0.8);
  tx(s,'HUMAN AUTHORIZATION',4.18,5.48,2.4,0.19,8,C.forest,true,{charSpacing:0.8});
  tx(s,'AI recommends; arbiter rules.',4.18,5.78,2.7,0.2,7.6,C.ink,false);
  ln(s,7.28,5.46,7.28,6.06,'B7C99C',0.8);
  tx(s,'PROGRAMMABLE SETTLEMENT',7.58,5.48,2.8,0.19,8,C.forest,true,{charSpacing:0.65});
  tx(s,'Contract enforces approved outcomes.',7.58,5.78,4.3,0.2,7.6,C.ink,false);
  tx(s,'Implementation note: handle HTS token association, allowance / authorization, and contract custody rules in the deposit flow.',0.78,6.49,11.5,0.2,7.2,C.muted,false,{italic:true});
  footer(s,5);
}

// SLIDE 6 — BUSINESS MODEL / VISION
{
  const s = pptx.addSlide(); bg(s); header(s,6,'Business model & vision','Build the trust layer for digital commerce.','Earn from protected activity, prove the workflow in a narrow segment, then expand through integrations.');
  tx(s,'REVENUE HYPOTHESES',0.76,2.09,3.2,0.22,8,C.green,true,{charSpacing:1.2});
  const rev=[
    [faMoneyBillTransfer,'01','PROTECTED PAYMENT FEE','A small fee on successfully settled payments',C.sage,C.forest],
    [faGavel,'02','ARBITRATION FEE','A disclosed fee when formal dispute review is used',C.lime2,C.green],
    [faCode,'03','BUSINESS API','Integration plans for marketplaces and platforms',C.goldLite,C.gold]
  ];
  rev.forEach((r,i)=>{
    const x=0.76+i*4.0;
    panel(s,x,2.48,3.68,1.5,C.paper);
    rect(s,x,2.48,3.68,0.12,r[4]);
    tx(s,r[1],x+0.2,2.75,0.42,0.18,7.5,C.muted,true);
    squareIcon(s,r[0],x+0.2,3.12,0.55,r[4],r[5]);
    tx(s,r[2],x+0.92,3.03,2.48,0.2,8,C.forest,true,{charSpacing:0.6});
    tx(s,r[3],x+0.92,3.32,2.46,0.43,7.5,C.muted,false);
  });
  // roadmap blocks
  tx(s,'GO-TO-MARKET SEQUENCE',0.76,4.37,3.3,0.2,8,C.green,true,{charSpacing:1.1});
  const phases=[
    ['01','FREELANCERS','Prove milestone protection',C.forest],
    ['02','SOCIAL COMMERCE','Make payment links shareable',C.green],
    ['03','MARKETPLACES','Offer escrow + dispute APIs',C.blue],
    ['04','WIDER COMMERCE','Expand where evidence is clear',C.gold]
  ];
  phases.forEach((p,i)=>{
    const x=0.76+i*3.0;
    rect(s,x,4.72,2.74,0.94,i===0?C.forest:C.paper,{line:i===0?C.forest:C.line,lineTransparency:0});
    tx(s,p[0],x+0.16,4.86,0.38,0.18,7.5,i===0?C.lime:C.green,true);
    tx(s,p[1],x+0.62,4.84,1.92,0.2,7.6,i===0?C.white:C.forest,true,{charSpacing:0.55});
    tx(s,p[2],x+0.62,5.14,1.94,0.28,7,i===0?'E6F0E6':C.muted,false);
  });
  // proof points and guardrail
  rect(s,0.76,5.97,11.74,0.68,C.sage);
  tx(s,'MEASURE',1.02,6.13,0.8,0.18,8,C.forest,true,{charSpacing:0.85});
  tx(s,'Protected volume  •  Resolution time  •  Repeat usage  •  Appeal rate',1.92,6.11,6.18,0.2,8,C.ink,false);
  tx(s,'No yield assumptions in the MVP.',8.48,6.11,3.65,0.2,8,C.forest,true,{align:'right'});
  footer(s,6);
}

// SLIDE 7 — THANK YOU
{
  const s = pptx.addSlide(); bg(s);
  rect(s,0,0,0.18,H,C.forest);
  tx(s,'07  /  THANK YOU',0.78,0.55,3.0,0.22,8,C.green,true,{charSpacing:1.4});
  tx(s,'TRUSETT',0.78,1.38,5.4,0.82,43,C.forest,true);
  tx(s,'Trust meets settlement.',0.82,2.34,5.6,0.4,22,C.ink,true);
  tx(s,'Making stablecoin commerce safer, fairer and more accessible.',0.84,2.93,5.8,0.34,11,C.muted,false);
  rect(s,0.82,3.67,0.85,0.1,C.lime);
  tx(s,'The future of payments should not require blind trust.',0.84,4.09,6.05,0.42,16,C.ink,true);
  tx(s,'It should be built on verifiable protection.',0.84,4.62,5.8,0.3,12,C.green,true);
  // contact / demo square
  rect(s,7.5,1.08,4.84,5.55,C.forest);
  rect(s,7.76,1.34,4.32,5.03,C.paper2);
  rect(s,7.76,1.34,4.32,0.35,C.lime);
  tx(s,'NEXT STEP  /  SEE IT IN ACTION',8.02,1.43,3.8,0.18,8,C.forest,true,{charSpacing:1.0});
  brandMark(s,9.35,2.08,1.12,true);
  tx(s,'LIVE DEMO',8.28,3.56,3.28,0.23,9,C.green,true,{align:'center',charSpacing:1.2});
  // blank QR placeholder, intentionally not fake code
  rect(s,9.18,3.93,1.42,1.42,C.white,{line:C.line,lineTransparency:0});
  for(let i=0;i<5;i++) for(let j=0;j<5;j++) if((i*j+i+j)%3===0) rect(s,9.33+i*0.22,4.08+j*0.22,0.13,0.13,C.forest);
  tx(s,'Replace with project demo QR',8.28,5.55,3.28,0.2,7,C.muted,false,{align:'center'});
  tx(s,'Team: [Team name]  •  Contact: [Email / handle]',0.84,6.48,5.9,0.22,8,C.muted,false);
  tx(s,'THANK YOU.',10.3,6.48,1.8,0.22,9,C.forest,true,{align:'right',charSpacing:1.0});
  rect(s,0.0,7.36,13.333,0.14,C.forest);
}

const out = path.join(__dirname,'TRUSETT_Hackathon_Pitch_Light.pptx');
pptx.writeFile({fileName:out}).then(()=>console.log('Wrote',out)).catch(e=>{console.error(e);process.exit(1)});
