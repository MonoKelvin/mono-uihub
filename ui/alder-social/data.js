/* Alder — content layer.
   Hand-written entries so the feed never degrades into lorem filler.
   `variant` drives the typographic layout system in styles.css. */

window.ALDER = (function () {
  'use strict';

  var IMG = [
    '1441974231531-c6227db76b6e',
    '1470071459604-3b5ec3a7fe05',
    '1502082553048-f009c37129b9',
    '1418065460487-3e41a6c84dc5',
    '1511497584788-876760111969',
    '1426604966848-d7adac402bff',
    '1448375240586-882707db888b',
    '1425913397330-cf8af2ff40a1',
    '1473448912268-2022ce9509d8',
    '1447752875215-b2761acb3c5d'
  ];

  function img(i) {
    return 'https://images.unsplash.com/photo-' + IMG[i % IMG.length] +
           '?w=1200&q=80&auto=format&fit=crop';
  }

  var AUTHORS = {
    mira:  { name: 'Mira Halloran',  handle: '@mirah',    p: 'mira' },
    teo:   { name: 'Teodor Vance',   handle: '@tvance',   p: 'teodor' },
    solv:  { name: 'Solveig Rand',   handle: '@slv.rand', p: 'solveig' },
    ezra:  { name: 'Ezra Blooms',    handle: '@ezra_b',   p: 'ezra' },
    nke:   { name: 'Nkechi Obi',     handle: '@nkobi',    p: 'nkechi' },
    jonas: { name: 'Jonas Reith',    handle: '@j.reith',  p: 'jonas' },
    hal:   { name: 'Halima Sarr',    handle: '@h.sarr',   p: 'halima' },
    bram:  { name: 'Bram de Vries',  handle: '@bdev',     p: 'bram' }
  };

  function entry(o) {
    o.img = o.img === false ? null : img(o.i || 0);
    o.plate = o.caption || null;
    return o;
  }

  var FEED = [
    entry({
      id: 'e1', variant: 'lead', who: 'mira', time: '2h',
      likes: 284, reposts: 96, replies: 31,
      text: 'Four hours in the ravine behind Gwithian counting things that are not moss. Found one, eventually: a patch of Splachnum on a rotting fence post, no bigger than a thumbnail. The whole colony shrinks to nothing inside a month and starts again from scratch. Hard to be cynical about that.',
      i: 0, caption: 'ravine below Gwithian<span class="sep"></span>06:40'
    }),
    entry({
      id: 'e2', variant: 'plain', who: 'teo', time: '4h',
      likes: 97, reposts: 22, replies: 18,
      text: 'Third shop this morning. The man at Valkyeria called a 1964 body just a housing, then charged me a hundred and eighty pounds for it. I have been turning that sentence over all day. The repair is mostly arguing with a previous owner about what was done to it.',
      img: false
    }),
    entry({
      id: 'e3', variant: 'duo', who: 'solv', time: '6h',
      likes: 63, reposts: 14, replies: 8,
      text: 'Barometer fell eleven hectopascals overnight and the wind backed from west to north north east. Nothing dramatic on the instruments, but the whole valley sounded different by seven.',
      i: 1, caption: 'fen head<span class="sep"></span>07:15'
    }),
    entry({
      id: 'e4', variant: 'quote', who: 'nke', time: '8h',
      likes: 412, reposts: 58, replies: 24,
      text: 'A glaze is a decision you cannot take back until it is already cool. That is the whole reason I keep firing badly on purpose.',
      img: false
    }),
    entry({
      id: 'e5', variant: 'plain', who: 'ezra', time: '1d',
      likes: 52, reposts: 9, replies: 4,
      text: 'Reselected the north bed. The michaelmas daisy came through the cold and nobody expected it. Slipped three tags in while I was there. Soil is a verb if you are honest about it.',
      img: false
    }),
    entry({
      id: 'e6', variant: 'plain', who: 'jonas', time: '1d',
      likes: 134, reposts: 31, replies: 12,
      text: 'Winter count is done. Eleven species, two of them first records for the square, one of them almost certainly a photograph of a photograph. Submission window closes Friday and I have already rewritten the same paragraph three times.',
      i: 7, caption: 'grid SQ41<span class="sep"></span>week 50'
    }),
    entry({
      id: 'e7', variant: 'duo', who: 'hal', time: '2d',
      likes: 88, reposts: 17, replies: 6,
      text: 'Six years of the same tide mill and the stones have worn a channel you could lay a hand along. Nobody designed it. Water is the only engineer that has ever finished a job.',
      i: 5, caption: 'tide mill, low water<span class="sep"></span>14:05'
    }),
    entry({
      id: 'e8', variant: 'quote', who: 'bram', time: '2d',
      likes: 276, reposts: 44, replies: 19,
      text: 'Every map is an argument about what deserves a name. The argument is the map.',
      img: false
    }),
    entry({
      id: 'e9', variant: 'plain', who: 'mira', time: '3d',
      likes: 45, reposts: 6, replies: 3,
      text: 'Woke to the sound of rain on the cold frame and did absolutely nothing about it for an hour. Transect sheet is behind by a week and I have made my peace.',
      i: 2, caption: 'cold frame, october<span class="sep"></span>05:50'
    }),
    entry({
      id: 'e10', variant: 'plain', who: 'teo', time: '3d',
      likes: 71, reposts: 12, replies: 9,
      text: 'Shutter finally runs at a consistent one eightieth. Not fast. Consistent. I have decided that this is the same kind of good as a recipe you can repeat.',
      img: false
    }),
    entry({
      id: 'e11', variant: 'plain', who: 'solv', time: '4d',
      likes: 39, reposts: 5, replies: 2,
      text: 'First hard frost. The anemometer is running rough and I am not going to fix it until spring, which is the most honest sentence I have written all year.',
      i: 8, caption: 'frost, first morning<span class="sep"></span>07:40'
    }),
    entry({
      id: 'e12', variant: 'plain', who: 'ezra', time: '5d',
      likes: 58, reposts: 8, replies: 5,
      text: 'Seed swap went well. Came home with more dahlia than I will ever plant and one packet of something unlabelled that I am choosing to trust.',
      img: false
    }),
    entry({
      id: 'e13', variant: 'plain', who: 'hal', time: '6d',
      likes: 112, reposts: 21, replies: 14,
      text: 'Photographed the same oak at the same hour for a hundred and ninth week. The tree is smaller than it was. That is what a hundred photographs is for.',
      i: 3, caption: 'the standing oak<span class="sep"></span>week 49'
    }),
    entry({
      id: 'e14', variant: 'plain', who: 'jonas', time: '6d',
      likes: 44, reposts: 7, replies: 3,
      text: 'Recorder jammed at minus four. Wrote the last two hours from memory afterwards and left the gap in the log on purpose, because a gap is data too.',
      img: false
    }),
    entry({
      id: 'e15', variant: 'plain', who: 'bram', time: '1w',
      likes: 96, reposts: 19, replies: 11,
      text: 'Rebuilt the south range entirely from a 1908 survey and two photographs. The original was wrong about the wall. I have left the wrong line on the plan underneath, drawn in a lighter hand.',
      i: 4, caption: 'south range, rebuilt<span class="sep"></span>survey 1908'
    }),
    entry({
      id: 'e16', variant: 'quote', who: 'nke', time: '1w',
      likes: 331, reposts: 61, replies: 27,
      text: 'Kiln shed rule one: never open the door before the cones have finished talking. Everything else is decoration.',
      img: false
    })
  ];

  var CIRCLES = [
    { key: 'ravine watch ravine mycology moss lichen transect', name: 'Ravine watch', members: 1204, p: 'circle1' },
    { key: 'slow repair camera repairlog film shutter', name: 'Slow repair', members: 863, p: 'circle2' },
    { key: 'fen head weather instruments barometric anemometer frost', name: 'Fen head weather', members: 2540, p: 'circle3' },
    { key: 'kiln shed glaze ceramics pottery firing cone', name: 'Kiln shed', members: 497, p: 'circle4' },
    { key: 'allotment north dahlia seed bed frost', name: 'Allotment north', members: 311, p: 'circle5' },
    { key: 'tide mill survey ordnance datum channel', name: 'Tide mill survey', members: 174, p: 'circle6' },
    { key: 'winter count grid square records recorder', name: 'Winter count', members: 938, p: 'circle7' },
    { key: 'sluice keepers pond weed gate', name: 'Sluice keepers', members: 122, p: 'circle8' }
  ];

  var TAGS = [
    { key: 'lichen', n: 412 },
    { key: 'repairlog', n: 268 },
    { key: 'glazefail', n: 193 },
    { key: 'barometric', n: 151 },
    { key: 'litterpickup', n: 98 },
    { key: 'transect', n: 87 },
    { key: 'seed swap', n: 64 },
    { key: 'survey', n: 51 }
  ];

  var ALERTS = [
    { id: 'a1', who: 'Nkechi Obi', p: 'nkechi', body: 'and six others liked your note about the flooded kiln.', t: '12m', unread: true },
    { id: 'a2', who: 'Teodor Vance', p: 'teodor', body: 'replied that the housing comment is doing a lot of work in that sentence.', t: '1h', unread: true },
    { id: 'a3', who: 'Ravine watch', p: 'circle1', body: 'added your February transect to the shared sheet.', t: '3h', unread: true },
    { id: 'a4', who: 'Ezra Blooms', p: 'ezra', body: 'started following you.', t: '2d', unread: false },
    { id: 'a5', who: 'Jonas Reith', p: 'jonas', body: 'mentioned you in the Winter count thread.', t: '2d', unread: false },
    { id: 'a6', who: 'Halima Sarr', p: 'halima', body: 'invited you to Tide mill survey.', t: '4d', unread: false },
    { id: 'a7', who: 'Solveig Rand', p: 'solveig', body: 'shared her Friday barometer sheet with you.', t: '6d', unread: false }
  ];

  var PROFILE = {
    who: 'mira',
    notes: 412,
    circles: 3,
    following: 188,
    joined: 'March 2021',
    bio: 'Fungal records for the Camborne coast. Keeper of the Friday transect sheet. Badly allergic to the word mycorrhiza.',
    tabs: {
      notes: [
        { i: 2, caption: 'week 41<span class="sep"></span>beech, fourth patch', quote: 'Hogwarts fungus, fourth patch of the season on the same fallen beech. It has been there since 2019 and it will outlive me.', t: '2 weeks ago' },
        { i: 3, caption: 'week 03<span class="sep"></span>railway cutting', quote: 'Nine species in the cutting. One new to the sheet, one of them probably just moss being smug about it.', t: '3 weeks ago' },
        { i: 9, caption: 'week 47<span class="sep"></span>the long oak', quote: 'Rain since dawn and the whole wood smelled like a cellar. Recorded nothing, watched for two hours.', t: '4 weeks ago' }
      ],
      plates: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      replies: [
        { text: 'Agreed on the north wall. Mine took two seasons as well.', to: 'Nkechi Obi', t: '1h' },
        { text: 'Barometric before emotional. Good instrument, poor week.', to: 'Solveig Rand', t: '5h' },
        { text: 'Housing is the right word for it. The shutter is the point.', to: 'Teodor Vance', t: '1d' },
        { text: 'Winter count people are a different breed. Happy to swap records whenever.', to: 'Jonas Reith', t: '3d' },
        { text: 'A gap in the log is data. That is going on a wall somewhere.', to: 'Bram de Vries', t: '5d' }
      ]
    }
  };

  return {
    AUTHORS: AUTHORS,
    FEED: FEED,
    CIRCLES: CIRCLES,
    TAGS: TAGS,
    ALERTS: ALERTS,
    PROFILE: PROFILE,
    avatar: function (key) {
      var a = AUTHORS[key];
      return 'https://i.pravatar.cc/160?u=' + ((a && a.p) || key);
    },
    image: img
  };
})();
