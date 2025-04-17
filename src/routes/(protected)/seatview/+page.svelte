<script context="module">
	// Optional: Add interactive JavaScript for dynamic tooltip
	// This will run in the browser when the component is mounted
	if (typeof window !== 'undefined') {
		window.addEventListener('DOMContentLoaded', () => {
			// Query within the specific component instance if possible, or use unique IDs
			const mapContainer = document.querySelector('.stadium-map-container'); // Or add a unique ID
			if (!mapContainer) return;

			const polygons = mapContainer.querySelectorAll('.stand-polygon');
			const tooltip = mapContainer.querySelector('.stand-tooltip');

			if (polygons && tooltip) {
				polygons.forEach((polygon) => {
					polygon.addEventListener('mouseenter', (e) => {
						// Get stand info directly from the polygon's data attributes
						const standId = polygon.getAttribute('data-stand-id');
						const occupancy = polygon.getAttribute('data-occupancy');
						const standName = polygon.getAttribute('data-stand-name') || standId; // Added name

						const headerContent = standName;
						const detailContent = `Occupancy: ${occupancy}%`;

						const tooltipHeader = tooltip.querySelector('.tooltip-header');
						const tooltipContent = tooltip.querySelector('.tooltip-content');

						if (tooltipHeader) tooltipHeader.textContent = headerContent;
						if (tooltipContent) tooltipContent.textContent = detailContent;

						tooltip.style.display = 'block';

						// Position the tooltip near the mouse - adjusted for container offset
						const updateTooltipPosition = (mouseevent) => {
							const containerRect = mapContainer.getBoundingClientRect();
							// Use clientX/clientY relative to viewport, adjust by container scroll/offset
							// For simplicity here, using pageX/pageY but consider clientX/Y + scroll offsets for more complex layouts
							tooltip.style.left = `${mouseevent.pageX - containerRect.left - window.scrollX + 15}px`; // Offset slightly from cursor
							tooltip.style.top = `${mouseevent.pageY - containerRect.top - window.scrollY - 10}px`; // Offset slightly above cursor
						};

						updateTooltipPosition(e);
						// Use mousemove on the container for smoother tracking if needed,
						// but polygon is usually sufficient
						polygon.addEventListener('mousemove', updateTooltipPosition);

						const leaveListener = () => {
							tooltip.style.display = 'none';
							polygon.removeEventListener('mousemove', updateTooltipPosition);
							polygon.removeEventListener('mouseleave', leaveListener); // Clean up listener
						};
						polygon.addEventListener('mouseleave', leaveListener);
					});
				});
			}
		});
	}
</script>

<script>
	import { onMount } from 'svelte'; // Import onMount if needed for JS initialization

	// Make standData a prop for reusability, provide default value
	export let standData = [
		{
			id: 'g-upper',
			name: 'G UPPER STAND',
			capacityBeforeSeatKill: 1776, // Total potential seats
			capacity: 1623, // Occupied seats (Adjusted for <30% demo)
			killed: 153,
			coordinates: [
				[
					// Polygon points for this stand
					{ x: 350, y: 175 },
					{ x: 354, y: 189 },
					{ x: 359, y: 206 },
					{ x: 363, y: 221 },
					{ x: 383, y: 216 },
					{ x: 400, y: 215 },
					{ x: 413, y: 214 },
					{ x: 432, y: 214 },
					{ x: 436, y: 193 },
					{ x: 437, y: 176 },
					{ x: 438, y: 168 },
					{ x: 424, y: 167 },
					{ x: 412, y: 166 },
					{ x: 395, y: 168 },
					{ x: 383, y: 168 },
					{ x: 367, y: 171 }
				]
			]
		},
		{
			id: 'f-upper',
			name: 'F UPPER STAND',
			capacityBeforeSeatKill: 1903, // Total potential seats
			capacity: 1795, // Occupied seats (Adjusted for <30% demo)
			killed: 108,
			coordinates: [
				[
					{ x: 462, y: 171 },
					{ x: 481, y: 176 },
					{ x: 501, y: 183 },
					{ x: 519, y: 192 },
					{ x: 535, y: 202 },
					{ x: 544, y: 207 },
					{ x: 535, y: 220 },
					{ x: 528, y: 229 },
					{ x: 516, y: 246 },
					{ x: 502, y: 237 },
					{ x: 484, y: 228 },
					{ x: 468, y: 222 },
					{ x: 452, y: 218 },
					{ x: 456, y: 199 },
					{ x: 458, y: 184 }
				]
			]
		},
		{
			id: 'e upper',
			name: 'E UPPER STAND',
			capacityBeforeSeatKill: 902, // Total potential seats
			capacity: 902, // Occupied seats (Adjusted for <30% demo)
			killed: 0,
			coordinates: [
				[
					{ x: 543, y: 270 },
					{ x: 561, y: 252 },
					{ x: 570, y: 261 },
					{ x: 577, y: 270 },
					{ x: 586, y: 282 },
					{ x: 592, y: 292 },
					{ x: 598, y: 304 },
					{ x: 605, y: 319 },
					{ x: 580, y: 328 },
					{ x: 575, y: 319 },
					{ x: 571, y: 309 },
					{ x: 565, y: 299 },
					{ x: 557, y: 288 },
					{ x: 549, y: 278 }
				]
			]
		},

		{
			id: 'c upper',
			name: 'C UPPER STAND',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{ x: 560, y: 499 },
					{ x: 565, y: 503 },
					{ x: 571, y: 507 },
					{ x: 576, y: 511 },
					{ x: 582, y: 515 },
					{ x: 589, y: 507 },
					{ x: 594, y: 498 },
					{ x: 600, y: 488 },
					{ x: 603, y: 480 },
					{ x: 606, y: 472 },
					{ x: 610, y: 462 },
					{ x: 613, y: 452 },
					{ x: 615, y: 442 },
					{ x: 606, y: 439 },
					{ x: 595, y: 436 },
					{ x: 589, y: 435 },
					{ x: 587, y: 442 },
					{ x: 584, y: 449 },
					{ x: 581, y: 458 },
					{ x: 578, y: 467 },
					{ x: 574, y: 476 },
					{ x: 569, y: 484 }
				]
			]
		},

		{
			id: 'd upper',
			name: 'D UPPER STAND',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 586,
						y: 347
					},
					{
						x: 593,
						y: 345
					},
					{
						x: 598,
						y: 343
					},
					{
						x: 604,
						y: 341
					},
					{
						x: 611,
						y: 340
					},
					{
						x: 615,
						y: 350
					},
					{
						x: 617,
						y: 360
					},
					{
						x: 619,
						y: 372
					},
					{
						x: 619,
						y: 382
					},
					{
						x: 620,
						y: 392
					},
					{
						x: 619,
						y: 403
					},
					{
						x: 619,
						y: 413
					},
					{
						x: 619,
						y: 419
					},
					{
						x: 611,
						y: 420
					},
					{
						x: 603,
						y: 418
					},
					{
						x: 592,
						y: 416
					},
					{
						x: 592,
						y: 406
					},
					{
						x: 593,
						y: 398
					},
					{
						x: 592,
						y: 389
					},
					{
						x: 592,
						y: 379
					},
					{
						x: 591,
						y: 371
					},
					{
						x: 590,
						y: 363
					},
					{
						x: 588,
						y: 357
					}
				]
			]
		},
		{
			id: 'h upper',
			name: 'H UPPER STAND',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 97, // Occupied seats (Adjusted for <30% demo)
			killed: 800,
			coordinates: [
				[
					{
						x: 284, // 283 + 1
						y: 265
					},
					{
						x: 279, // 278 + 1
						y: 259
					},
					{
						x: 273, // 272 + 1
						y: 254
					},
					{
						x: 269, // 268 + 1
						y: 249
					},
					{
						x: 263, // 262 + 1
						y: 243
					},
					{
						x: 257, // 256 + 1
						y: 237
					},
					{
						x: 250, // 249 + 1
						y: 231
					},
					{
						x: 258, // 257 + 1
						y: 225
					},
					{
						x: 267, // 266 + 1
						y: 217
					},
					{
						x: 275, // 274 + 1
						y: 211
					},
					{
						x: 283, // 282 + 1
						y: 205
					},
					{
						x: 292, // 291 + 1
						y: 199
					},
					{
						x: 300, // 299 + 1
						y: 195
					},
					{
						x: 308, // 307 + 1
						y: 190
					},
					{
						x: 316, // 315 + 1
						y: 186
					},
					{
						x: 326, // 325 + 1
						y: 182
					},
					{
						x: 330, // 329 + 1
						y: 194
					},
					{
						x: 336, // 335 + 1
						y: 209
					},
					{
						x: 340, // 339 + 1
						y: 219
					},
					{
						x: 344, // 343 + 1
						y: 227
					},
					{
						x: 335, // 334 + 1
						y: 231
					},
					{
						x: 325, // 324 + 1
						y: 235
					},
					{
						x: 316, // 315 + 1
						y: 240
					},
					{
						x: 307, // 306 + 1
						y: 247
					},
					{
						x: 297, // 296 + 1
						y: 253
					}
				]
			]
		},

		{
			id: 'i upper',
			name: 'I UPPER STAND',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 497, // Occupied seats (Adjusted for <30% demo)
			killed: 800,
			coordinates: [
				[
					{
						x: 234,
						y: 355
					},
					{
						x: 227,
						y: 354
					},
					{
						x: 219,
						y: 352
					},
					{
						x: 211,
						y: 350
					},
					{
						x: 203,
						y: 349
					},
					{
						x: 195,
						y: 347
					},
					{
						x: 191,
						y: 344
					},
					{
						x: 191,
						y: 338
					},
					{
						x: 193,
						y: 330
					},
					{
						x: 194,
						y: 318
					},
					{
						x: 197,
						y: 310
					},
					{
						x: 202,
						y: 299
					},
					{
						x: 207,
						y: 288
					},
					{
						x: 213,
						y: 278
					},
					{
						x: 218,
						y: 270
					},
					{
						x: 223,
						y: 263
					},
					{
						x: 230,
						y: 268
					},
					{
						x: 236,
						y: 272
					},
					{
						x: 243,
						y: 277
					},
					{
						x: 249,
						y: 281
					},
					{
						x: 255,
						y: 285
					},
					{
						x: 262,
						y: 290
					},
					{
						x: 260,
						y: 295
					},
					{
						x: 255,
						y: 302
					},
					{
						x: 250,
						y: 311
					},
					{
						x: 246,
						y: 321
					},
					{
						x: 242,
						y: 329
					},
					{
						x: 239,
						y: 338
					}
				]
			]
		},
		{
			id: 'j upper',
			name: 'J UPPER STAND',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 237,
						y: 445
					},
					{
						x: 231,
						y: 446
					},
					{
						x: 223,
						y: 448
					},
					{
						x: 215,
						y: 450
					},
					{
						x: 207,
						y: 453
					},
					{
						x: 198,
						y: 455
					},
					{
						x: 191,
						y: 456
					},
					{
						x: 188,
						y: 453
					},
					{
						x: 187,
						y: 444
					},
					{
						x: 185,
						y: 434
					},
					{
						x: 182,
						y: 431
					},
					{
						x: 181,
						y: 423
					},
					{
						x: 181,
						y: 416
					},
					{
						x: 181,
						y: 408
					},
					{
						x: 180,
						y: 401
					},
					{
						x: 181,
						y: 393
					},
					{
						x: 181,
						y: 383
					},
					{
						x: 182,
						y: 376
					},
					{
						x: 183,
						y: 369
					},
					{
						x: 188,
						y: 369
					},
					{
						x: 193,
						y: 369
					},
					{
						x: 201,
						y: 371
					},
					{
						x: 207,
						y: 371
					},
					{
						x: 214,
						y: 372
					},
					{
						x: 219,
						y: 372
					},
					{
						x: 224,
						y: 372
					},
					{
						x: 230,
						y: 372
					},
					{
						x: 231,
						y: 378
					},
					{
						x: 229,
						y: 385
					},
					{
						x: 230,
						y: 393
					},
					{
						x: 230,
						y: 401
					},
					{
						x: 231,
						y: 408
					},
					{
						x: 231,
						y: 416
					},
					{
						x: 232,
						y: 423
					},
					{
						x: 234,
						y: 430
					},
					{
						x: 235,
						y: 435
					}
				]
			]
		},

		{
			id: 'l upper',
			name: 'L UPPER STAND',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 497, // Occupied seats (Adjusted for <30% demo)
			killed: 800,
			coordinates: [
				[
					{
						x: 308,
						y: 546 // 543 + 3
					},
					{
						x: 288,
						y: 574 // 571 + 3
					},
					{
						x: 306,
						y: 586 // 583 + 3
					},
					{
						x: 323,
						y: 595 // 592 + 3
					},
					{
						x: 339,
						y: 601 // 598 + 3
					},
					{
						x: 353,
						y: 606 // 603 + 3
					},
					{
						x: 356,
						y: 604 // 601 + 3
					},
					{
						x: 365,
						y: 606 // 603 + 3
					},
					{
						x: 369,
						y: 592 // 589 + 3
					},
					{
						x: 369,
						y: 582 // 579 + 3
					},
					{
						x: 373,
						y: 574 // 571 + 3
					},
					{
						x: 357,
						y: 569 // 566 + 3
					},
					{
						x: 344,
						y: 565 // 562 + 3
					},
					{
						x: 332,
						y: 560 // 557 + 3
					},
					{
						x: 321,
						y: 554 // 551 + 3
					}
				]
			]
		},
		{
			id: 'k upper',
			name: 'K UPPER STAND',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 198,
						y: 479
					},
					{
						x: 201,
						y: 486
					},
					{
						x: 204,
						y: 493
					},
					{
						x: 208,
						y: 503
					},
					{
						x: 213,
						y: 511
					},
					{
						x: 218,
						y: 519
					},
					{
						x: 224,
						y: 527
					},
					{
						x: 229,
						y: 535
					},
					{
						x: 236,
						y: 542
					},
					{
						x: 241,
						y: 549
					},
					{
						x: 246,
						y: 554
					},
					{
						x: 252,
						y: 549
					},
					{
						x: 257,
						y: 543
					},
					{
						x: 263,
						y: 538
					},
					{
						x: 268,
						y: 532
					},
					{
						x: 273,
						y: 528
					},
					{
						x: 280,
						y: 521
					},
					{
						x: 275,
						y: 515
					},
					{
						x: 270,
						y: 509
					},
					{
						x: 265,
						y: 503
					},
					{
						x: 260,
						y: 496
					},
					{
						x: 256,
						y: 489
					},
					{
						x: 252,
						y: 482
					},
					{
						x: 249,
						y: 476
					},
					{
						x: 245,
						y: 467
					},
					{
						x: 242,
						y: 461
					},
					{
						x: 231,
						y: 466
					},
					{
						x: 219,
						y: 470
					},
					{
						x: 208,
						y: 475
					}
				]
			]
		},

		{
			id: 'kmk upper',
			name: 'KMK UPPER STAND',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 391,
						y: 565 // 563 + 2
					},
					{
						x: 391,
						y: 561 // 559 + 2
					},
					{
						x: 392,
						y: 553 // 551 + 2
					},
					{
						x: 392,
						y: 549 // 547 + 2
					},
					{
						x: 402,
						y: 550 // 548 + 2
					},
					{
						x: 411,
						y: 549 // 547 + 2
					},
					{
						x: 420,
						y: 549 // 547 + 2
					},
					{
						x: 428,
						y: 549 // 547 + 2
					},
					{
						x: 437,
						y: 548 // 546 + 2
					},
					{
						x: 445,
						y: 546 // 544 + 2
					},
					{
						x: 454,
						y: 543 // 541 + 2
					},
					{
						x: 463,
						y: 540 // 538 + 2
					},
					{
						x: 477,
						y: 535 // 533 + 2
					},
					{
						x: 487,
						y: 529 // 527 + 2
					},
					{
						x: 497,
						y: 524 // 522 + 2
					},
					{
						x: 509,
						y: 515 // 513 + 2
					},
					{
						x: 517,
						y: 507 // 505 + 2
					},
					{
						x: 520,
						y: 508 // 506 + 2
					},
					{
						x: 529,
						y: 518 // 516 + 2
					},
					{
						x: 521,
						y: 525 // 523 + 2
					},
					{
						x: 510,
						y: 535 // 533 + 2
					},
					{
						x: 498,
						y: 541 // 539 + 2
					},
					{
						x: 484,
						y: 549 // 547 + 2
					},
					{
						x: 470,
						y: 555 // 553 + 2
					},
					{
						x: 457,
						y: 560 // 558 + 2
					},
					{
						x: 437,
						y: 563 // 561 + 2
					},
					{
						x: 420,
						y: 565 // 563 + 2
					},
					{
						x: 404,
						y: 565 // 563 + 2
					}
				]
			]
		},

		{
			id: 'c lower',
			name: 'C LOWER STAND',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 578,
						y: 431 // 429 + 2
					},
					{
						x: 572,
						y: 426 // 424 + 2
					},
					{
						x: 554,
						y: 422 // 420 + 2
					},
					{
						x: 551,
						y: 432 // 430 + 2
					},
					{
						x: 550,
						y: 435 // 433 + 2
					},
					{
						x: 544,
						y: 452 // 450 + 2
					},
					{
						x: 535,
						y: 470 // 468 + 2
					},
					{
						x: 527,
						y: 481 // 479 + 2
					},
					{
						x: 523,
						y: 486 // 484 + 2
					},
					{
						x: 544,
						y: 505 // 503 + 2
					},
					{
						x: 553,
						y: 495 // 493 + 2
					},
					{
						x: 550,
						y: 493 // 491 + 2
					},
					{
						x: 556,
						y: 482 // 480 + 2
					},
					{
						x: 565,
						y: 467 // 465 + 2
					},
					{
						x: 570,
						y: 454 // 452 + 2
					},
					{
						x: 573,
						y: 443 // 441 + 2
					}
				]
			]
		},

		{
			id: 'e lower',
			name: 'E LOWER STAND',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 569,
						y: 333 // 332 + 1
					},
					{
						x: 565,
						y: 339 // 338 + 1
					},
					{
						x: 547,
						y: 346 // 345 + 1
					},
					{
						x: 543,
						y: 335 // 334 + 1
					},
					{
						x: 537,
						y: 323 // 322 + 1
					},
					{
						x: 528,
						y: 310 // 309 + 1
					},
					{
						x: 520,
						y: 300 // 299 + 1
					},
					{
						x: 512,
						y: 291 // 290 + 1
					},
					{
						x: 508,
						y: 287 // 286 + 1
					},
					{
						x: 526,
						y: 266 // 265 + 1
					},
					{
						x: 536,
						y: 274 // 273 + 1
					},
					{
						x: 533,
						y: 277 // 276 + 1
					},
					{
						x: 540,
						y: 285 // 284 + 1
					},
					{
						x: 547,
						y: 293 // 292 + 1
					},
					{
						x: 551,
						y: 300 // 299 + 1
					},
					{
						x: 558,
						y: 309 // 308 + 1
					},
					{
						x: 563,
						y: 318 // 317 + 1
					}
				]
			]
		},

		{
			id: 'd lower',
			name: 'D LOWER STAND',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 575,
						y: 350 // 348 + 2
					},
					{
						x: 568,
						y: 347 // 345 + 2
					},
					{
						x: 549,
						y: 353 // 351 + 2
					},
					{
						x: 553,
						y: 365 // 363 + 2
					},
					{
						x: 555,
						y: 377 // 375 + 2
					},
					{
						x: 556,
						y: 390 // 388 + 2
					},
					{
						x: 556,
						y: 407 // 405 + 2
					},
					{
						x: 554,
						y: 415 // 413 + 2
					},
					{
						x: 557,
						y: 417 // 415 + 2
					},
					{
						x: 573,
						y: 420 // 418 + 2
					},
					{
						x: 573,
						y: 420 // 418 + 2 (Note: original point was duplicated)
					},
					{
						x: 579,
						y: 416 // 414 + 2
					},
					{
						x: 580,
						y: 407 // 405 + 2
					},
					{
						x: 580,
						y: 391 // 389 + 2
					},
					{
						x: 579,
						y: 374 // 372 + 2
					},
					{
						x: 577,
						y: 364 // 362 + 2
					}
				]
			]
		},

		{
			id: 'f lower',
			name: 'F LOWER STAND',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 446,
						y: 238 // 236 + 2
					},
					{
						x: 442,
						y: 237 // 235 + 2
					},
					{
						x: 438,
						y: 254 // 252 + 2
					},
					{
						x: 455,
						y: 259 // 257 + 2
					},
					{
						x: 467,
						y: 263 // 261 + 2
					},
					{
						x: 480,
						y: 269 // 267 + 2
					},
					{
						x: 494,
						y: 277 // 275 + 2
					},
					{
						x: 504,
						y: 264 // 262 + 2
					},
					{
						x: 494,
						y: 258 // 256 + 2
					},
					{
						x: 482,
						y: 252 // 250 + 2
					},
					{
						x: 469,
						y: 245 // 243 + 2
					}
				]
			]
		},

		{
			id: 'g lower2',
			name: 'G LOWER STAND2',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 497, // Occupied seats (Adjusted for <30% demo)
			killed: 800,
			coordinates: [
				[
					{
						x: 416,
						y: 226
					},
					{
						x: 431,
						y: 226
					},
					{
						x: 436,
						y: 229
					},
					{
						x: 432,
						y: 252
					},
					{
						x: 416,
						y: 251
					}
				]
			]
		},

		{
			id: 'g lower1',
			name: 'G LOWER STAND1',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 364,
						y: 232
					},
					{
						x: 361,
						y: 235
					},
					{
						x: 368,
						y: 257
					},
					{
						x: 384,
						y: 253
					},
					{
						x: 379,
						y: 229
					}
				]
			]
		},

		{
			id: 'h lower',
			name: 'H LOWER STAND',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 293, // 294 - 1
						y: 274 // 273 + 1
					},
					{
						x: 303, // 304 - 1
						y: 264 // 263 + 1
					},
					{
						x: 312, // 313 - 1
						y: 257 // 256 + 1
					},
					{
						x: 321, // 322 - 1
						y: 251 // 250 + 1
					},
					{
						x: 336, // 337 - 1
						y: 242 // 241 + 1
					},
					{
						x: 349, // 350 - 1
						y: 237 // 236 + 1
					},
					{
						x: 354, // 355 - 1
						y: 237 // 236 + 1
					},
					{
						x: 361, // 362 - 1
						y: 259 // 258 + 1
					},
					{
						x: 349, // 350 - 1
						y: 264 // 263 + 1
					},
					{
						x: 337, // 338 - 1
						y: 271 // 270 + 1
					},
					{
						x: 326, // 327 - 1
						y: 278 // 277 + 1
					},
					{
						x: 317, // 318 - 1
						y: 285 // 284 + 1
					},
					{
						x: 309, // 310 - 1
						y: 291 // 290 + 1
					}
				]
			]
		},

		{
			id: 'i lower',
			name: 'I LOWER STAND',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 272,
						y: 299 // 297 + 2
					},
					{
						x: 269,
						y: 297 // 295 + 2
					},
					{
						x: 277,
						y: 287 // 285 + 2
					},
					{
						x: 299,
						y: 305 // 303 + 2
					},
					{
						x: 294,
						y: 311 // 309 + 2
					},
					{
						x: 289,
						y: 319 // 317 + 2
					},
					{
						x: 284,
						y: 327 // 325 + 2
					},
					{
						x: 279,
						y: 337 // 335 + 2
					},
					{
						x: 275,
						y: 349 // 347 + 2
					},
					{
						x: 270,
						y: 361 // 359 + 2
					},
					{
						x: 269,
						y: 368 // 366 + 2
					},
					{
						x: 246,
						y: 364 // 362 + 2
					},
					{
						x: 245,
						y: 360 // 358 + 2
					},
					{
						x: 250,
						y: 344 // 342 + 2
					},
					{
						x: 255,
						y: 329 // 327 + 2
					},
					{
						x: 264,
						y: 312 // 310 + 2
					}
				]
			]
		},

		{
			id: 'j lower',
			name: 'J LOWER STAND',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 243,
						y: 376 // 374 + 2
					},
					{
						x: 245,
						y: 372 // 370 + 2
					},
					{
						x: 268,
						y: 376 // 374 + 2
					},
					{
						x: 267,
						y: 392 // 390 + 2
					},
					{
						x: 267,
						y: 408 // 406 + 2
					},
					{
						x: 270,
						y: 428 // 426 + 2
					},
					{
						x: 273,
						y: 439 // 437 + 2
					},
					{
						x: 251,
						y: 447 // 445 + 2
					},
					{
						x: 248,
						y: 443 // 441 + 2
					},
					{
						x: 246,
						y: 431 // 429 + 2
					},
					{
						x: 243,
						y: 418 // 416 + 2
					},
					{
						x: 241,
						y: 404 // 402 + 2
					},
					{
						x: 241,
						y: 393 // 391 + 2
					}
				]
			]
		},

		{
			id: 'k lower',
			name: 'K LOWER STAND',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 255,
						y: 458 // 459 - 1
					},
					{
						x: 255,
						y: 454 // 455 - 1
					},
					{
						x: 276,
						y: 447 // 448 - 1
					},
					{
						x: 283,
						y: 459 // 460 - 1
					},
					{
						x: 288,
						y: 470 // 471 - 1
					},
					{
						x: 293,
						y: 477 // 478 - 1
					},
					{
						x: 302,
						y: 490 // 491 - 1
					},
					{
						x: 309,
						y: 498 // 499 - 1
					},
					{
						x: 317,
						y: 504 // 505 - 1
					},
					{
						x: 299,
						y: 526 // 527 - 1
					},
					{
						x: 288,
						y: 518 // 519 - 1
					},
					{
						x: 292,
						y: 515 // 516 - 1
					},
					{
						x: 285,
						y: 507 // 508 - 1
					},
					{
						x: 279,
						y: 500 // 501 - 1
					},
					{
						x: 273,
						y: 491 // 492 - 1
					},
					{
						x: 266,
						y: 481 // 482 - 1
					},
					{
						x: 261,
						y: 472 // 473 - 1
					}
				]
			]
		},

		{
			id: 'l lower mcc',
			name: 'L LOWER STAND MCC',

			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 329,
						y: 517 // 515 + 2
					},
					{
						x: 314,
						y: 536 // 534 + 2
					},
					{
						x: 324,
						y: 542 // 540 + 2
					},
					{
						x: 333,
						y: 548 // 546 + 2
					},
					{
						x: 344,
						y: 553 // 551 + 2
					},
					{
						x: 353,
						y: 556 // 554 + 2
					},
					{
						x: 365,
						y: 560 // 558 + 2
					},
					{
						x: 375,
						y: 562 // 560 + 2
					},
					{
						x: 380,
						y: 539 // 537 + 2
					},
					{
						x: 369,
						y: 535 // 533 + 2
					},
					{
						x: 357,
						y: 531 // 529 + 2
					},
					{
						x: 346,
						y: 526 // 524 + 2
					}
				]
			]
		},

		{
			id: 'kmc a/c box',
			name: 'KMC A/C BOX',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 97, // Occupied seats (Adjusted for <30% demo)
			killed: 800,
			coordinates: [
				[
					{
						x: 391,
						y: 565 // 563 + 2
					},
					{
						x: 390,
						y: 596 // 594 + 2
					},
					{
						x: 397,
						y: 597 // 595 + 2
					},
					{
						x: 397,
						y: 602 // 600 + 2
					},
					{
						x: 415,
						y: 603 // 601 + 2
					},
					{
						x: 435,
						y: 603 // 601 + 2
					},
					{
						x: 460,
						y: 598 // 596 + 2
					},
					{
						x: 477,
						y: 595 // 593 + 2
					},
					{
						x: 494,
						y: 588 // 586 + 2
					},
					{
						x: 507,
						y: 580 // 578 + 2
					},
					{
						x: 518,
						y: 574 // 572 + 2
					},
					{
						x: 538,
						y: 558 // 556 + 2
					},
					{
						x: 554,
						y: 573 // 571 + 2
					},
					{
						x: 569,
						y: 559 // 557 + 2
					},
					{
						x: 529,
						y: 518 // 516 + 2
					},
					{
						x: 517,
						y: 529 // 527 + 2
					},
					{
						x: 507,
						y: 535 // 533 + 2
					},
					{
						x: 494,
						y: 543 // 541 + 2
					},
					{
						x: 479,
						y: 550 // 548 + 2
					},
					{
						x: 465,
						y: 556 // 554 + 2
					},
					{
						x: 447,
						y: 561 // 559 + 2
					},
					{
						x: 429,
						y: 564 // 562 + 2
					},
					{
						x: 411,
						y: 564 // 562 + 2
					}
				]
			]
		},

		{
			id: 'c a/c box',
			name: 'C A/C BOX',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 97, // Occupied seats (Adjusted for <30% demo)
			killed: 800,
			coordinates: [
				[
					{
						x: 560,
						y: 500 // 498 + 2
					},
					{
						x: 564,
						y: 493 // 491 + 2
					},
					{
						x: 572,
						y: 481 // 479 + 2
					},
					{
						x: 579,
						y: 466 // 464 + 2
					},
					{
						x: 584,
						y: 452 // 450 + 2
					},
					{
						x: 588,
						y: 436 // 434 + 2
					},
					{
						x: 578,
						y: 432 // 430 + 2
					},
					{
						x: 572,
						y: 446 // 444 + 2
					},
					{
						x: 568,
						y: 460 // 458 + 2
					},
					{
						x: 561,
						y: 474 // 472 + 2
					},
					{
						x: 555,
						y: 486 // 484 + 2
					},
					{
						x: 550,
						y: 493 // 491 + 2
					}
				]
			]
		},

		{
			id: 'd a/c box',
			name: 'D A/C BOX',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 497, // Occupied seats (Adjusted for <30% demo)
			killed: 800,
			coordinates: [
				[
					{
						x: 574,
						y: 349 // 347 + 2
					},
					{
						x: 586,
						y: 345 // 343 + 2
					},
					{
						x: 589,
						y: 355 // 353 + 2
					},
					{
						x: 592,
						y: 373 // 371 + 2
					},
					{
						x: 593,
						y: 387 // 385 + 2
					},
					{
						x: 593,
						y: 402 // 400 + 2
					},
					{
						x: 592,
						y: 417 // 415 + 2
					},
					{
						x: 579,
						y: 416 // 414 + 2
					},
					{
						x: 580,
						y: 403 // 401 + 2
					},
					{
						x: 579,
						y: 383 // 381 + 2
					},
					{
						x: 579,
						y: 383 // 381 + 2 (Note: original point was duplicated)
					},
					{
						x: 578,
						y: 370 // 368 + 2
					}
				]
			]
		},

		{
			id: 'e a/c box',
			name: 'E A/C BOX',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 497, // Occupied seats (Adjusted for <30% demo)
			killed: 800,
			coordinates: [
				[
					{
						x: 581,
						y: 329
					},
					{
						x: 569,
						y: 333
					},
					{
						x: 563,
						y: 320
					},
					{
						x: 556,
						y: 308
					},
					{
						x: 549,
						y: 297
					},
					{
						x: 540,
						y: 285
					},
					{
						x: 533,
						y: 277
					},
					{
						x: 542,
						y: 268
					},
					{
						x: 551,
						y: 278
					},
					{
						x: 558,
						y: 286
					},
					{
						x: 567,
						y: 299
					},
					{
						x: 573,
						y: 310
					},
					{
						x: 577,
						y: 318
					}
				]
			]
		},

		{
			id: 'f a/c box',
			name: 'F A/C BOX',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 497, // Occupied seats (Adjusted for <30% demo)
			killed: 800,
			coordinates: [
				[
					{
						x: 450,
						y: 218 // 216 + 2
					},
					{
						x: 448,
						y: 230 // 228 + 2
					},
					{
						x: 464,
						y: 235 // 233 + 2
					},
					{
						x: 478,
						y: 240 // 238 + 2
					},
					{
						x: 495,
						y: 248 // 246 + 2
					},
					{
						x: 510,
						y: 257 // 255 + 2
					},
					{
						x: 518,
						y: 247 // 245 + 2
					},
					{
						x: 506,
						y: 240 // 238 + 2
					},
					{
						x: 493,
						y: 233 // 231 + 2
					},
					{
						x: 479,
						y: 226 // 224 + 2
					},
					{
						x: 465,
						y: 221 // 219 + 2
					}
				]
			]
		},

		{
			id: 'g a/c box',
			name: 'G A/C BOX',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 497, // Occupied seats (Adjusted for <30% demo)
			killed: 800,
			coordinates: [
				[
					{
						x: 361,
						y: 221 // 219 + 2
					},
					{
						x: 365,
						y: 234 // 232 + 2
					},
					{
						x: 378,
						y: 230 // 228 + 2
					},
					{
						x: 397,
						y: 227 // 225 + 2
					},
					{
						x: 416,
						y: 227 // 225 + 2
					},
					{
						x: 431,
						y: 228 // 226 + 2
					},
					{
						x: 432,
						y: 215 // 213 + 2
					},
					{
						x: 416,
						y: 214 // 212 + 2
					},
					{
						x: 398,
						y: 214 // 212 + 2
					},
					{
						x: 382,
						y: 216 // 214 + 2
					}
				]
			]
		},

		{
			id: 'h a/c box',
			name: 'H A/C BOX',

			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 284, // 285 - 1
						y: 265 // 264 + 1
					},
					{
						x: 293, // 294 - 1
						y: 273 // 272 + 1
					},
					{
						x: 300, // 301 - 1
						y: 266 // 265 + 1
					},
					{
						x: 313, // 314 - 1
						y: 257 // 256 + 1
					},
					{
						x: 327, // 328 - 1
						y: 248 // 247 + 1
					},
					{
						x: 341, // 342 - 1
						y: 241 // 240 + 1
					},
					{
						x: 349, // 350 - 1
						y: 237 // 236 + 1
					},
					{
						x: 344, // 345 - 1
						y: 226 // 225 + 1
					},
					{
						x: 336, // 337 - 1
						y: 230 // 229 + 1
					},
					{
						x: 326, // 327 - 1
						y: 234 // 233 + 1
					},
					{
						x: 312, // 313 - 1
						y: 243 // 242 + 1
					},
					{
						x: 300, // 301 - 1
						y: 250 // 249 + 1
					},
					{
						x: 292, // 293 - 1
						y: 257 // 256 + 1
					}
				]
			]
		},

		{
			id: 'i a/c box',
			name: 'I A/C BOX',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 262,
						y: 290
					},
					{
						x: 273,
						y: 297
					},
					{
						x: 267,
						y: 306
					},
					{
						x: 260,
						y: 319
					},
					{
						x: 254,
						y: 331
					},
					{
						x: 249,
						y: 346
					},
					{
						x: 246,
						y: 359
					},
					{
						x: 233,
						y: 356
					},
					{
						x: 235,
						y: 347
					},
					{
						x: 238,
						y: 338
					},
					{
						x: 242,
						y: 328
					},
					{
						x: 246,
						y: 319
					},
					{
						x: 251,
						y: 308
					},
					{
						x: 255,
						y: 302
					}
				]
			]
		},

		{
			id: 'j a/c box',
			name: 'J A/C BOX',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 230,
						y: 375 // 373 + 2
					},
					{
						x: 243,
						y: 376 // 374 + 2
					},
					{
						x: 242,
						y: 387 // 385 + 2
					},
					{
						x: 242,
						y: 398 // 396 + 2
					},
					{
						x: 243,
						y: 414 // 412 + 2
					},
					{
						x: 245,
						y: 427 // 425 + 2
					},
					{
						x: 248,
						y: 443 // 441 + 2
					},
					{
						x: 237,
						y: 446 // 444 + 2
					},
					{
						x: 233,
						y: 434 // 432 + 2
					},
					{
						x: 231,
						y: 423 // 421 + 2
					},
					{
						x: 230,
						y: 411 // 409 + 2
					},
					{
						x: 230,
						y: 402 // 400 + 2
					},
					{
						x: 229,
						y: 390 // 388 + 2
					}
				]
			]
		},

		{
			id: 'k a/c box',
			name: 'K A/C BOX',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 244, // 242 + 2
						y: 462 // 460 + 2
					},
					{
						x: 255, // 253 + 2
						y: 457 // 455 + 2
					},
					{
						x: 260, // 258 + 2
						y: 466 // 464 + 2
					},
					{
						x: 264, // 262 + 2
						y: 475 // 473 + 2
					},
					{
						x: 270, // 268 + 2
						y: 485 // 483 + 2
					},
					{
						x: 276, // 274 + 2
						y: 494 // 492 + 2
					},
					{
						x: 283, // 281 + 2
						y: 503 // 501 + 2
					},
					{
						x: 292, // 290 + 2
						y: 513 // 511 + 2
					},
					{
						x: 283, // 281 + 2
						y: 522 // 520 + 2
					},
					{
						x: 275, // 273 + 2
						y: 515 // 513 + 2
					},
					{
						x: 268, // 266 + 2
						y: 505 // 503 + 2
					},
					{
						x: 262, // 260 + 2
						y: 495 // 493 + 2
					},
					{
						x: 256, // 254 + 2
						y: 487 // 485 + 2
					},
					{
						x: 251, // 249 + 2
						y: 477 // 475 + 2
					}
				]
			]
		},

		{
			id: 'l a/c box',
			name: 'L A/C BOX',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 316, // 314 + 2
						y: 534 // 532 + 2
					},
					{
						x: 309, // 307 + 2
						y: 545 // 543 + 2
					},
					{
						x: 316, // 314 + 2
						y: 549 // 547 + 2
					},
					{
						x: 323, // 321 + 2
						y: 554 // 552 + 2
					},
					{
						x: 331, // 329 + 2
						y: 557 // 555 + 2
					},
					{
						x: 340, // 338 + 2
						y: 562 // 560 + 2
					},
					{
						x: 350, // 348 + 2
						y: 566 // 564 + 2
					},
					{
						x: 359, // 357 + 2
						y: 569 // 567 + 2
					},
					{
						x: 367, // 365 + 2
						y: 571 // 569 + 2
					},
					{
						x: 374, // 372 + 2
						y: 573 // 571 + 2
					},
					{
						x: 377, // 375 + 2
						y: 561 // 559 + 2
					},
					{
						x: 368, // 366 + 2
						y: 558 // 556 + 2
					},
					{
						x: 358, // 356 + 2
						y: 555 // 553 + 2
					},
					{
						x: 348, // 346 + 2
						y: 551 // 549 + 2
					},
					{
						x: 340, // 338 + 2
						y: 548 // 546 + 2
					},
					{
						x: 332, // 330 + 2
						y: 544 // 542 + 2
					},
					{
						x: 325, // 323 + 2
						y: 539 // 537 + 2
					}
				]
			]
		},

		{
			id: 'kmc upper',
			name: 'KMC UPPER STAND',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 398,
						y: 603 // 602 + 1
					},
					{
						x: 394,
						y: 636 // 635 + 1
					},
					{
						x: 405,
						y: 637 // 636 + 1
					},
					{
						x: 405,
						y: 641 // 640 + 1
					},
					{
						x: 425,
						y: 641 // 640 + 1
					},
					{
						x: 452,
						y: 638 // 637 + 1
					},
					{
						x: 477,
						y: 634 // 633 + 1
					},
					{
						x: 497,
						y: 625 // 624 + 1
					},
					{
						x: 514,
						y: 618 // 617 + 1
					},
					{
						x: 526,
						y: 610 // 609 + 1
					},
					{
						x: 539,
						y: 602 // 601 + 1
					},
					{
						x: 552,
						y: 592 // 591 + 1
					},
					{
						x: 563,
						y: 582 // 581 + 1
					},
					{
						x: 538,
						y: 557 // 556 + 1
					},
					{
						x: 529,
						y: 566 // 565 + 1
					},
					{
						x: 516,
						y: 575 // 574 + 1
					},
					{
						x: 504,
						y: 583 // 582 + 1
					},
					{
						x: 489,
						y: 590 // 589 + 1
					},
					{
						x: 473,
						y: 595 // 594 + 1
					},
					{
						x: 448,
						y: 601 // 600 + 1
					},
					{
						x: 431,
						y: 602 // 601 + 1
					},
					{
						x: 410,
						y: 602 // 601 + 1
					}
				]
			]
		},

		{
			id: 'f l2 box',
			name: 'F L2 BOX',
			capacityBeforeSeatKill: 897, // Total potential seats
			capacity: 889, // Occupied seats (Adjusted for <30% demo)
			killed: 8,
			coordinates: [
				[
					{
						x: 481,
						y: 241 // 240 + 1
					},
					{
						x: 477,
						y: 248 // 247 + 1
					},
					{
						x: 483,
						y: 252 // 251 + 1
					},
					{
						x: 490,
						y: 255 // 254 + 1
					},
					{
						x: 496,
						y: 259 // 258 + 1
					},
					{
						x: 506,
						y: 265 // 264 + 1
					},
					{
						x: 511,
						y: 258 // 257 + 1
					},
					{
						x: 504,
						y: 254 // 253 + 1
					},
					{
						x: 495,
						y: 248 // 247 + 1
					}
				]
			]
		}
	];
	export let imageSrc = '/stadium4.png'; // Make image source a prop
	export let imageWidth = 800; // Original image width
	export let imageHeight = 800; // Original image height

	// Generate a unique ID for this component instance for pattern/filter IDs
	const componentId = `stand-map-${Math.random().toString(36).substr(2, 9)}`;

	function getOccupancyInfo(stand) {
		const totalSeats = stand.capacityBeforeSeatKill;
		const occupiedSeats = stand.capacity;

		if (!totalSeats || totalSeats <= 0) {
			return { percentage: 0, color: '#888888', patternId: 'pattern-empty' }; // Handle zero/invalid total seats
		}

		const percentage = (occupiedSeats / totalSeats) * 100;
		let color, patternId;

		if (percentage < 30) {
			color = '#ffd700'; // Gold
			patternId = 'pattern-low';
		} else if (percentage <= 70) {
			color = '#ffb347'; // Pastel orange
			patternId = 'pattern-medium';
		} else {
			color = '#ff8c00'; // Dark orange
			patternId = 'pattern-high';
		}

		return {
			percentage: parseFloat(percentage.toFixed(1)),
			color,
			patternId
		};
	}

	function formatPoints(coords) {
		if (!coords || !Array.isArray(coords) || coords.length === 0 || !Array.isArray(coords[0])) {
			console.warn('Invalid coordinates format:', coords);
			return '';
		}
		// Assuming the first array in coordinates holds the points
		return coords[0].map((p) => `${p.x},${p.y}`).join(' ') || '';
	}

	function getShadowId(standId) {
		return `shadow-${componentId}-${standId.replace(/[^a-zA-Z0-9]/g, '-')}`; // Ensure valid ID and unique per component
	}

	// Tooltip positioning needs correction inside the module script
	// Let's move the core DOM manipulation logic to onMount for better Svelte practice
	onMount(() => {
		const mapContainer = document.getElementById(`map-container-${componentId}`); // Use unique ID
		if (!mapContainer) return;

		const polygons = mapContainer.querySelectorAll('.stand-polygon');
		const tooltip = mapContainer.querySelector('.stand-tooltip');

		if (!polygons || !tooltip) return;

		polygons.forEach((polygon) => {
			let updateTooltipPosition; // Declare function variable here

			const handleMouseEnter = (e) => {
				const standId = polygon.getAttribute('data-stand-id');
				const occupancy = polygon.getAttribute('data-occupancy');
				const standName = polygon.getAttribute('data-stand-name') || standId;

				const headerContent = standName;
				const detailContent = `Occupancy: ${occupancy}%`;

				const tooltipHeader = tooltip.querySelector('.tooltip-header');
				const tooltipContent = tooltip.querySelector('.tooltip-content');

				if (tooltipHeader) tooltipHeader.textContent = headerContent;
				if (tooltipContent) tooltipContent.textContent = detailContent;

				tooltip.style.display = 'block';

				// Define the position update function inside the scope where tooltip and mapContainer are available
				updateTooltipPosition = (mouseevent) => {
					// Use clientX/clientY for position relative to viewport
					// Adjust by subtracting the container's top-left corner coordinates
					const containerRect = mapContainer.getBoundingClientRect();
					tooltip.style.left = `${mouseevent.clientX - containerRect.left + 15}px`; // Offset slightly right from cursor
					tooltip.style.top = `${mouseevent.clientY - containerRect.top - 10}px`; // Offset slightly above cursor
				};

				updateTooltipPosition(e); // Initial position
				polygon.addEventListener('mousemove', updateTooltipPosition);
			};

			const handleMouseLeave = () => {
				tooltip.style.display = 'none';
				if (updateTooltipPosition) {
					// Check if function was assigned
					polygon.removeEventListener('mousemove', updateTooltipPosition);
				}
			};

			polygon.addEventListener('mouseenter', handleMouseEnter);
			polygon.addEventListener('mouseleave', handleMouseLeave);
		});

		// Cleanup function for when component unmounts
		return () => {
			polygons.forEach((polygon) => {
				// Removing listeners explicitly can be complex; Svelte often handles this,
				// but manual cleanup for listeners added outside Svelte's system is good practice.
				// However, the previous approach of removing inside mouseleave might suffice.
			});
		};
	});
</script>

<!-- Use a unique ID for the container -->
<div
	id="map-container-{componentId}"
	class="stadium-map-container"
	style="position: relative; width: 100%; max-width: {imageWidth}px; aspect-ratio: {imageWidth /
		imageHeight};"
>
	<h1 class="flex items-center justify-center font-bold">Stadium OverView Presence</h1>
	<!-- Removed the separate img tag -->

	<svg
		class="stadium-overlay"
		style="display: block; width: 100%; height: 100%;"
		viewBox="0 0 {imageWidth} {imageHeight}"
		preserveAspectRatio="xMidYMid meet"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
	>
		<!-- Define patterns and filters first -->
		<defs>
			{#each standData as stand (stand.id)}
				<filter id={getShadowId(stand.id)} x="-20%" y="-20%" width="140%" height="140%">
					<feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3" flood-color="#000000" />
				</filter>
			{/each}

			<pattern
				id="{componentId}-pattern-low"
				patternUnits="userSpaceOnUse"
				width="10"
				height="10"
				patternTransform="rotate(45)"
			>
				<rect width="10" height="10" fill="#ffd700" />
				<line x1="0" y1="0" x2="0" y2="10" stroke="#f8e58c" stroke-width="2" />
			</pattern>
			<pattern
				id="{componentId}-pattern-medium"
				patternUnits="userSpaceOnUse"
				width="10"
				height="10"
			>
				<rect width="10" height="10" fill="#ffb347" />
				<circle cx="5" cy="5" r="2" fill="#ffe4b5" />
			</pattern>
			<pattern id="{componentId}-pattern-high" patternUnits="userSpaceOnUse" width="12" height="12">
				<rect width="12" height="12" fill="#ff8c00" />
				<path d="M0,0 L12,12 M12,0 L0,12" stroke="#ffa07a" stroke-width="1" />
			</pattern>
			<!-- Optional: Keep texture filter if desired -->
			<filter id="{componentId}-texture-filter">
				<feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
				<feDisplacementMap
					in="SourceGraphic"
					in2="noise"
					scale="3"
					xChannelSelector="R"
					yChannelSelector="G"
				/>
			</filter>
			<filter id="{componentId}-inner-glow">
				<feGaussianBlur stdDeviation="2" result="blur" />
				<feComposite in="SourceGraphic" in2="blur" operator="over" />
			</filter>
		</defs>

		<!-- Embed the image *inside* the SVG -->
		<image
			xlink:href={imageSrc}
			href={imageSrc}
			x="0"
			y="0"
			width={imageWidth}
			height={imageHeight}
			preserveAspectRatio="xMidYMid meet"
		/>

		<!-- Draw polygons on top of the image -->
		{#each standData as stand (stand.id)}
			{@const info = getOccupancyInfo(stand)}
			{@const points = formatPoints(stand.coordinates)}
			{@const patternUrl = `url(#${componentId}-${info.patternId})`}
			{@const shadowUrl = `url(#${getShadowId(stand.id)})`}

			{#if points}
				<polygon
					class="stand-polygon"
					{points}
					fill={patternUrl}
					stroke="#ffffff"
					stroke-width="1.5"
					filter={shadowUrl}
					data-stand-id={stand.id}
					data-stand-name={stand.name}
					data-occupancy={info.percentage}
				>
					<!-- Native SVG tooltip (simpler, less customizable) -->
					<title>{stand.name} - Occupancy: {info.percentage}%</title>
				</polygon>

				<!-- Highlight overlay polygon -->
				<polygon
					class="stand-highlight"
					{points}
					fill="none"
					stroke="rgba(255, 255, 255, 0.7)"
					stroke-width="0.8"
					stroke-dasharray="3,3"
					style="pointer-events: none;"
				/>
			{/if}
		{/each}
	</svg>

	<!-- HTML Tooltip remains, positioned relative to the container -->
	<div class="stand-tooltip" style="display: none;">
		<div class="tooltip-header"></div>
		<div class="tooltip-content"></div>
	</div>
</div>

<style>
	.stadium-map-container {
		border: 2px solid #2c3e50;
		border-radius: 8px;
		overflow: hidden;
		/* max-width: 100%; */ /* Let max-width on style control this */
		/* height: auto; */ /* Use aspect-ratio for sizing */
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
		background-color: #f5f5f5; /* Shows behind SVG if image loads slow */
		position: relative; /* Keep for absolute tooltip */
	}

	.stadium-overlay {
		/* display: block; */ /* Good practice for SVG */
		/* width: 100%; */
		/* height: 100%; */
		/* No longer needs absolute positioning */
		/* pointer-events: none; */ /* Remove this, polygons need events */
	}

	.stadium-overlay image {
		pointer-events: none; /* Image shouldn't capture mouse events */
	}

	.stand-polygon {
		pointer-events: auto; /* Polygons should be interactive */
		transition: all 0.2s ease-in-out; /* Faster transition */
		cursor: pointer;
		/* filter: brightness(0.95); Slightly dim base */
	}

	.stand-polygon:hover {
		stroke: #ffffff;
		stroke-width: 2.5; /* Slightly thicker hover stroke */
		/* Combine filter effects */
		filter: brightness(1.15) drop-shadow(0 0 6px rgba(0, 0, 0, 0.6));
		/* Apply the shadow filter on hover too, potentially combined with brightness */
		/* filter: url(#shadow-filter-id) brightness(1.2); */ /* Example if needed */
	}

	/* Removed hover effect on highlight, apply directly to polygon hover */
	.stand-highlight {
		pointer-events: none;
		/* opacity: 0; */ /* Not needed if not toggling */
		/* transition: opacity 0.3s ease; */
	}

	/* .stand-polygon:hover + .stand-highlight { */
	/* opacity: 1; */ /* Not needed */
	/* } */

	.stand-tooltip {
		position: absolute; /* Position relative to the map container */
		background: rgba(25, 25, 25, 0.85); /* Slightly darker */
		color: white;
		padding: 8px 12px;
		border-radius: 5px;
		font-size: 13px;
		font-family: sans-serif;
		pointer-events: none; /* Tooltip should not be interactive */
		z-index: 100;
		box-shadow: 0 3px 12px rgba(0, 0, 0, 0.4);
		max-width: 220px;
		/* transform: translate(-50%, -100%); /* Removed: Positioning now done via JS left/top */
		white-space: nowrap; /* Prevent wrapping if content is short */
		opacity: 0; /* Start hidden, fade in */
		transition: opacity 0.15s ease-in-out;
	}
	/* Add fade-in effect */
	.stand-tooltip[style*='display: block'] {
		opacity: 1;
	}

	.tooltip-header {
		font-weight: bold;
		margin-bottom: 4px;
		padding-bottom: 4px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.25);
		font-size: 14px;
	}

	.tooltip-content {
		font-size: 12px;
	}
</style>
