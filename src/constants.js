export const CANVAS_WIDTH = 900;
export const CANVAS_HEIGHT = 600;

export const PLAYER_RADIUS = 15;
export const PLAYER_SPEED = 220;

export const COLORS = {
  yellow: '#FFE066',
  pink: '#FF6B9D',
  orange: '#FF8C42',
  lightBlue: '#4ECDC4',
  green: '#7AE582',
  seafoamGreen: '#56E39F',
  red: '#FF6B6B',
  purple: '#B266FF',
};

export const COLOR_NAMES = ['yellow', 'pink', 'orange', 'lightBlue', 'green', 'seafoamGreen', 'red', 'purple'];
export const COLOR_LABELS = ['Yellow', 'Pink', 'Orange', 'Light Blue', 'Green', 'Seafoam Green', 'Red', 'Purple'];

export const KEYBINDINGS = [
  { up: 'w', down: 's', left: 'a', right: 'd' },
  { up: 'i', down: 'k', left: 'j', right: 'l' },
  { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' },
];

export const DIFFICULTY = {
  normal: { duration: 60, label: 'Normal' },
  hard: { duration: 90, label: 'Hard' },
  nightmare: { duration: 120, label: 'Nightmare' },
  ghost: { duration: 120, label: 'Ghost' },
};

export const DIFFICULTY_KEYS = ['normal', 'hard', 'nightmare', 'ghost'];

export const TOTAL_ROUNDS = 5;

export const OBSTACLE_TYPES = ['rectangle', 'circleStrike', 'laser'];

export const SPAWN_INTERVAL_START = 2.0;
export const SPAWN_INTERVAL_END = 0.4;

export const RECT_SPEED = 180;
export const RECT_HEIGHT = 40;
export const RECT_SLIM_HEIGHT = 16;
export const GAP_WIDTH = PLAYER_RADIUS * 5;

export const CIRCLE_STRIKE_WARN_TIME = 2.0;
export const CIRCLE_STRIKE_PERSIST_TIME = 3.0;
export const CIRCLE_STRIKE_RADIUS = 40;

export const LASER_WARN_TIME = 2.0;
export const LASER_SWEEP_TIME = 0.4;
export const LASER_LINGER_TIME = 0.5;
export const LASER_THICKNESS = 8;

export const SPAWN_POSITIONS = [
  { x: CANVAS_WIDTH * 0.25, y: CANVAS_HEIGHT * 0.5 },
  { x: CANVAS_WIDTH * 0.75, y: CANVAS_HEIGHT * 0.5 },
  { x: CANVAS_WIDTH * 0.5, y: CANVAS_HEIGHT * 0.5 },
];
