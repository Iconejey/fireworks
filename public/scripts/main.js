let rockets = [];
const vibration = innerWidth * devicePixelRatio < 1080 ? 70 : 6;

const colors = ['#ee2b49', '#fff800', '#5df040', '#2673fd', '#9c3eda'];
const gray = '#444';

// Get a random color
function randColor() {
	return colors[Math.floor(Math.random() * colors.length)];
}

// Delay function
function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// Interval for given time
async function interval(int, dur, func) {
	const int_id = setInterval(func, int);
	await delay(dur);
	clearInterval(int_id);
}

// Basic firework
function basicFirework() {
	const rocket = Rocket.create(gray, rocket => {
		navigator.vibrate(vibration);
		const color = randColor();

		// Explosion into smaller rockets
		for (let i = 0; i < 10; i++) {
			const new_rocket = Rocket.create(color);
			new_rocket.x = rocket.x;
			new_rocket.y = rocket.y;
			new_rocket.vx = (Math.random() * 2 - 1) * 1;
			new_rocket.vy = (Math.random() * 2 - 1) * 1;
			new_rocket.friction = 0.99;
			new_rocket.duration = Math.random() * 500;
			rockets.push(new_rocket);
		}
	});

	rockets.push(rocket);
}

// Multiple stage firework
function multFirework(parent, divs, stages, stage_rocket, explosion) {
	// Stage rocket
	if (stages > 1) {
		for (let i = 0; i < divs; i++) {
			const rocket = Rocket.create(gray);
			rocket.then = () => multFirework(rocket, divs, stages - 1, stage_rocket, explosion);

			// If there is a parent rocket
			if (parent) {
				rocket.x = parent.x;
				rocket.y = parent.y;
				rocket.vx = Math.random() * 2 - 1;
				rocket.vy = Math.random() * 2 - 1.5;
				rocket.duration = Math.random() * 500 + 100;
				rocket.exp_color = parent.exp_color;
			}

			// First stage rocket
			else {
				rocket.x = innerWidth / 2;
				rocket.y = innerHeight;
				rocket.vx = (Math.random() * 2 - 1) * 0.3;
				rocket.vy = -2;
				rocket.exp_color = randColor();
			}

			stage_rocket(rocket);
			rockets.push(rocket);

			if (!parent) break;
		}
	}

	// Explosion rocket
	if (stages === 1) explosion(parent);
}

onload = () => {
	$('button').onclick = async e => {
		// Clear the body
		document.body.innerHTML = '';

		// Start the game loop
		tick();

		const stage_rocket = rocket => {
			navigator.vibrate(vibration);
		};

		const explosion = parent => {
			navigator.vibrate(vibration);
			const color = parent.exp_color;

			for (let i = 0; i < 10; i++) {
				const new_rocket = Rocket.create(randColor());
				new_rocket.x = parent.x;
				new_rocket.y = parent.y;
				new_rocket.vx = (Math.random() * 2 - 1) * 1;
				new_rocket.vy = (Math.random() * 2 - 1) * 1;
				new_rocket.friction = 0.99;
				new_rocket.duration = Math.random() * 500;
				new_rocket.color = color;
				rockets.push(new_rocket);
			}
		};

		onclick = () => {
			// multFirework(null, 3, 4, stage_rocket, explosion);
		};

		// Basic fireworks
		await interval(500, 4100, basicFirework);

		// Multiple stage fireworks
		await interval(2000, 4100, () => multFirework(null, 3, 4, stage_rocket, explosion));

		await delay(2000);

		// Basic fireworks
		await interval(100, 1000, basicFirework);

		await delay(1000);
		multFirework(null, 2, 6, stage_rocket, explosion);
	};
};

// Main game loop
function tick() {
	let new_rockets = [];

	// Loop through all the rockets
	for (const rocket of rockets) {
		rocket.tick();

		if (rocket.dead) rocket.then?.(rocket);
		else new_rockets.push(rocket);
	}

	// Update the rockets
	rockets = new_rockets;

	// Continue the game loop
	requestAnimationFrame(tick);
}

class Rocket {
	// Create a new rocket
	static create(color, then) {
		const rocket = new Rocket();
		rocket.x = innerWidth / 2;
		rocket.y = innerHeight;
		rocket.vx = Math.random() * 2 - 1;
		rocket.vy = -2;
		rocket.color = color;
		rocket.duration = Math.random() * 500 + 500;
		rocket.then = then;
		return rocket;
	}

	// Check if the rocket is done
	get dead() {
		return Date.now() - this.start > this.duration;
	}

	constructor() {
		this.u = innerWidth / 100;
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.color = '';
		this.speed = 0;
		this.duration = 0;
		this.friction = 0.99;

		this.last_part_x = 0;
		this.last_part_y = 0;

		this.start = Date.now();
	}

	// Move the rocket
	tick() {
		// Move the rocket
		this.x += this.vx * this.u;
		this.y += this.vy * this.u;

		// Add friction
		this.vx *= this.friction;
		this.vy *= this.friction;

		const last_part_dx = this.x - this.last_part_x;
		const last_part_dy = this.y - this.last_part_y;

		const distance_sqr = last_part_dx ** 2 + last_part_dy ** 2;

		// Create a particle every few pixels
		if (distance_sqr > 5) {
			this.last_part_x = this.x;
			this.last_part_y = this.y;
			this.createParticle();
		}
	}

	// Create a particle
	createParticle() {
		const particle = render(html`<div class="particle" style="left: ${this.x}px; top: ${this.y}px; --color: ${this.color}; --glow: ${this.color}22; --duration: ${this.duration}ms;"></div>`);
		setTimeout(() => particle.remove(), 500);
		document.body.appendChild(particle);
	}
}
