// Slot positions as fractions of the frame image (1181x1772).
// Each slot: { x, y, w, h } all 0.0–1.0

const SLOTS_6_DEFAULT = [
  { x: 0.0533, y: 0.1394, w: 0.4039, h: 0.2692 },
  { x: 0.5487, y: 0.1383, w: 0.4039, h: 0.2692 },
  { x: 0.0533, y: 0.4137, w: 0.4056, h: 0.2703 },
  { x: 0.5555, y: 0.4137, w: 0.4056, h: 0.2703 },
  { x: 0.0533, y: 0.6896, w: 0.4056, h: 0.2703 },
  { x: 0.5580, y: 0.6924, w: 0.4056, h: 0.2703 },
]

const SLOTS_FRAME1 = [
  { x: 0.0542, y: 0.1394, w: 0.4022, h: 0.2675 },
  { x: 0.5495, y: 0.1355, w: 0.4022, h: 0.2675 },
  { x: 0.0576, y: 0.4228, w: 0.3988, h: 0.2698 },
  { x: 0.5495, y: 0.4228, w: 0.4022, h: 0.2698 },
  { x: 0.0576, y: 0.7079, w: 0.3988, h: 0.2698 },
  { x: 0.5495, y: 0.7079, w: 0.4022, h: 0.2698 },
]

const SLOTS_FRAME2 = [
  { x: 0.0229, y: 0.1473, w: 0.4589, h: 0.2568 },
  { x: 0.5199, y: 0.1473, w: 0.4589, h: 0.2568 },
  { x: 0.0229, y: 0.4306, w: 0.4589, h: 0.2568 },
  { x: 0.5199, y: 0.4306, w: 0.4589, h: 0.2568 },
  { x: 0.0229, y: 0.7292, w: 0.4589, h: 0.2568 },
  { x: 0.5199, y: 0.7292, w: 0.4589, h: 0.2568 },
]

const SLOTS_FRAME3 = [
  { x: 0.0288, y: 0.1976, w: 0.4403, h: 0.2512 },
  { x: 0.5233, y: 0.0192, w: 0.4403, h: 0.2512 },
  { x: 0.0288, y: 0.4662, w: 0.4403, h: 0.2512 },
  { x: 0.5241, y: 0.2823, w: 0.4403, h: 0.2512 },
  { x: 0.0288, y: 0.7348, w: 0.4403, h: 0.2512 },
  { x: 0.5436, y: 0.5458, w: 0.4403, h: 0.2512 },
]

const SLOTS_FRAME4 = [
  { x: 0.0720, y: 0.0423, w: 0.3818, h: 0.1908 },
  { x: 0.5563, y: 0.0423, w: 0.3818, h: 0.1908 },
  { x: 0.0720, y: 0.2963, w: 0.3818, h: 0.1908 },
  { x: 0.5563, y: 0.2963, w: 0.3818, h: 0.1908 },
  { x: 0.0779, y: 0.5463, w: 0.3818, h: 0.1908 },
  { x: 0.5563, y: 0.5527, w: 0.3818, h: 0.1908 },
]

const SLOTS_FRAME5 = [
  { x: 0.0373, y: 0.1265, w: 0.4394, h: 0.2653 },
  { x: 0.4996, y: 0.0220, w: 0.4750, h: 0.2664 },
  { x: 0.0373, y: 0.4153, w: 0.4394, h: 0.2653 },
  { x: 0.4996, y: 0.3060, w: 0.4750, h: 0.2664 },
  { x: 0.0263, y: 0.7043, w: 0.4505, h: 0.2653 },
  { x: 0.4996, y: 0.5899, w: 0.4750, h: 0.2664 },
]

const SLOTS_FRAME6 = [
  { x: 0.0550, y: 0.1078, w: 0.4217, h: 0.2010 },
  { x: 0.5309, y: 0.2021, w: 0.4217, h: 0.2010 },
  { x: 0.0415, y: 0.4238, w: 0.4217, h: 0.2010 },
  { x: 0.5301, y: 0.4729, w: 0.4217, h: 0.2010 },
  { x: 0.0627, y: 0.7372, w: 0.4217, h: 0.2010 },
  { x: 0.5301, y: 0.7767, w: 0.4217, h: 0.2010 },
]

const SLOTS_FRAME8 = [
  { x: 0.5394, y: 0.3043, w: 0.3573, h: 0.3319 },
  { x: 0.0661, y: 0.7073, w: 0.3988, h: 0.2529 },
]

const SLOTS_FRAME9 = [
  { x: 0.0762, y: 0.2940, w: 0.8654, h: 0.3064 },
]

const SLOTS_FRAME10 = [
  { x: 0.0821, y: 0.2783, w: 0.4064, h: 0.2896 },
  { x: 0.5165, y: 0.6412, w: 0.4064, h: 0.2461 },
]

export const FRAMES = [
  {
    id: 1, name: 'Frame 1',
    src: '/frames/KelanaRasa/1.png',
    bg:  '/frames/frames-photo/1/Background.png',
    overlay: '/frames/frames-photo/1/Icon.png',
    accent: '#E91E63', slots: SLOTS_FRAME1,
  },
  {
    id: 2, name: 'Frame 2',
    src: '/frames/KelanaRasa/2.png',
    accent: '#9C27B0', slots: SLOTS_FRAME2,
  },
  {
    id: 3, name: 'Frame 3',
    src: '/frames/KelanaRasa/3.png',
    bg:  '/frames/frames-photo/3/Background.png',
    overlay: '/frames/frames-photo/3/Icon.png',
    accent: '#3F51B5', slots: SLOTS_FRAME3,
  },
  {
    id: 4, name: 'Frame 4',
    src: '/frames/KelanaRasa/4.png',
    bg:  '/frames/frames-photo/4/Background.png',
    overlay: '/frames/frames-photo/4/Icon.png',
    accent: '#00ACC1', slots: SLOTS_FRAME4,
  },
  {
    id: 5, name: 'Frame 5',
    src: '/frames/KelanaRasa/5.png',
    bg:  '/frames/frames-photo/5/Background.png',
    overlay: '/frames/frames-photo/5/Icon.png',
    accent: '#43A047', slots: SLOTS_FRAME5,
  },
  {
    id: 6, name: 'Frame 6',
    src: '/frames/KelanaRasa/6.png',
    bg:  '/frames/frames-photo/6/Background.png',
    overlay: '/frames/frames-photo/6/Icon.png',
    accent: '#FB8C00', slots: SLOTS_FRAME6,
  },
  {
    id: 7, name: 'Frame 7',
    src: '/frames/KelanaRasa/7.png',
    accent: '#E53935', slots: SLOTS_6_DEFAULT,
    comingSoon: true,
  },
  { id: 8,  name: 'Frame 8',  src: '/frames/KelanaRasa/8.png',  accent: '#546E7A', slots: SLOTS_FRAME8  },
  { id: 9,  name: 'Frame 9',  src: '/frames/KelanaRasa/9.png',  accent: '#6D4C41', slots: SLOTS_FRAME9  },
  { id: 10, name: 'Frame 10', src: '/frames/KelanaRasa/10.png', accent: '#FF7043', slots: SLOTS_FRAME10 },
]
