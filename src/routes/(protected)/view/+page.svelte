<script lang="ts">
	let selectedUrl = '';
	let isOpen = false;
	let hoveredBlock: any = null;
	let hoverTimeout: any = null;
	let viewMode: 'snap' | 'camera' = 'snap'; // Add view mode toggle state
	let activeBlock: any = null; // Track selected camera for both snap and camera views

	const blockData = [{'name': 'Gate 1 IN(3)Enterance',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_GATE_1_IN3ENTERANCE',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_3.jpg'],
  'top': 9026,
  'left': 7440},
 {'name': 'Gate 1 OUT(4)Exit view',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_GATE_1_OUT4EXIT_VIEW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_4.jpg'],
  'top': 9103,
  'left': 7864},
 {'name': 'Gate 4 IN(5)Queue View',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_GATE_4_IN5QUEUE_VIEW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_5.jpg'],
  'top': 6855,
  'left': 7566},
 {'name': 'Gate 4 OUT(6)Road view',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_GATE_4_OUT6ROAD_VIEW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_6.jpg'],
  'top': 6828,
  'left': 7847},
 {'name': 'Gate 5 OUT(7)Parking view',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_GATE_5_OUT7PARKING_VIEW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_7.jpg'],
  'top': 5957,
  'left': 7820},
 {'name': 'Gate 6 IN(8)Parking view',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_GATE_6_IN8PARKING_VIEW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_8.jpg'],
  'top': 4725,
  'left': 7566},
 {'name': 'Gate 6 OUT(9)Road view',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_GATE_6_OUT9ROAD_VIEW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_9.jpg'],
  'top': 4837,
  'left': 7836},
 {'name': 'Gate 8 IN(10)Blurr ',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_GATE_8_IN10BLURR',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_10.jpg'],
  'top': 1535,
  'left': 5940},
 {'name': 'Gate 9 IN(11)Road view',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_GATE_9_IN11ROAD_VIEW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_11.jpg'],
  'top': 1673,
  'left': 5169},
 {'name': 'Gate 10 OUT(12)Road view',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_GATE_10_OUT12ROAD_VIEW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_12.jpg'],
  'top': 1783,
  'left': 4789},
 {'name': 'Gate 11 IN(13)Parking view',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_GATE_11_IN13PARKING_VIEW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_13.jpg'],
  'top': 1568,
  'left': 4188},
 {'name': 'Gate 13 IN(14)Parking view',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_GATE_13_IN14PARKING_VIEW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_14.jpg'],
  'top': 4080,
  'left': 2238},
 {'name': 'Gate 13 OUT(15)Blurr ',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_GATE_13_OUT15BLURR',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_15.jpg'],
  'top': 4080,
  'left': 1957},
 {'name': 'Gate 14 IN(16)Entrance checking view',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_GATE_14_IN16ENTRANCE_CHECKING_VIEW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_16.jpg'],
  'top': 4934,
  'left': 2244},
 {'name': 'Gate 14 OUT(17)Queue View',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_GATE_14_OUT17QUEUE_VIEW',
  'snapshot_urls': [''],
  'top': 4961,
  'left': 2106},
 {'name': 'Gate 15 OUT(18)Blurr ',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_GATE_15_OUT18BLURR',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_18.jpg'],
  'top': 5894,
  'left': 2106},
 {'name': 'Gate 16 OUT(19)Road & Building View',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_GATE_16_OUT19ROAD_BUILDING_VIEW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_19.jpg'],
  'top': 7123,
  'left': 2080},
 {'name': 'MCC GATE IN(20)Parking view',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_MCC_GATE_IN20PARKING_VIEW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_20.jpg'],
  'top': 7740,
  'left': 2026},
 {'name': 'MCC GATE OUT(21)Road view',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_MCC_GATE_OUT21ROAD_VIEW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.6_21.jpg'],
  'top': 7766,
  'left': 2086},
 {'name': 'AG RAM SING GATE1',
  'type': 'GATE CAMERA',
  'url': 'http://107.170.54.225:5010/GATE_CAMERA_AG_RAM_SING_GATE1',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.2_8.jpg'],
  'top': 3600,
  'left': 2086},
 {'name': 'C STAND UPPER ENTRY1',
  'type': 'STAND ENTRY & EXIT CAMERA',
  'url': 'http://107.170.54.225:5010/STAND_ENTRY_EXIT_CAMERA_C_STAND_UPPER_ENTRY1',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.4.7_2.jpg'],
  'top': 6908,
  'left': 7073},
 {'name': 'C STAND LOWER ENTRY2',
  'type': 'STAND ENTRY & EXIT CAMERA',
  'url': 'http://107.170.54.225:5010/STAND_ENTRY_EXIT_CAMERA_C_STAND_LOWER_ENTRY2',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.3_12.jpg'],
  'top': 6735,
  'left': 6600},
 {'name': 'D STAND UPPER ENTRY3',
  'type': 'STAND ENTRY & EXIT CAMERA',
  'url': 'http://107.170.54.225:5010/STAND_ENTRY_EXIT_CAMERA_D_STAND_UPPER_ENTRY3',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.4.7_14.jpg'],
  'top': 5802,
  'left': 7460},
 {'name': 'D STAND LOWER ENTRY4',
  'type': 'STAND ENTRY & EXIT CAMERA',
  'url': 'http://107.170.54.225:5010/STAND_ENTRY_EXIT_CAMERA_D_STAND_LOWER_ENTRY4',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.5.2_29.jpg'],
  'top': 5795,
  'left': 6960},
 {'name': 'E STAND UPPER ENTRY5',
  'type': 'STAND ENTRY & EXIT CAMERA',
  'url': 'http://107.170.54.225:5010/STAND_ENTRY_EXIT_CAMERA_E_STAND_UPPER_ENTRY5',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.4.7_27.jpg'],
  'top': 4821,
  'left': 7226},
 {'name': 'E STAND LOWER ENTRY6',
  'type': 'STAND ENTRY & EXIT CAMERA',
  'url': 'http://107.170.54.225:5010/STAND_ENTRY_EXIT_CAMERA_E_STAND_LOWER_ENTRY6',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.5.2_29.jpg'],
  'top': 4921,
  'left': 6820},
 {'name': 'F STAND UPPER ENTRY7',
  'type': 'STAND ENTRY & EXIT CAMERA',
  'url': 'http://107.170.54.225:5010/STAND_ENTRY_EXIT_CAMERA_F_STAND_UPPER_ENTRY7',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.4.8_8.jpg'],
  'top': 3580,
  'left': 6366},
 {'name': 'F STAND LOWER ENTRY8',
  'type': 'STAND ENTRY & EXIT CAMERA',
  'url': 'http://107.170.54.225:5010/STAND_ENTRY_EXIT_CAMERA_F_STAND_LOWER_ENTRY8',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.4.8_7.jpg'],
  'top': 4073,
  'left': 6093},
 {'name': 'G STAND UPPER ENTRY9',
  'type': 'STAND ENTRY & EXIT CAMERA',
  'url': 'http://107.170.54.225:5010/STAND_ENTRY_EXIT_CAMERA_G_STAND_UPPER_ENTRY9',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.4.8_24.jpg'],
  'top': 3233,
  'left': 5293},
 {'name': 'G STAND LOWER ENTRY10',
  'type': 'STAND ENTRY & EXIT CAMERA',
  'url': 'http://107.170.54.225:5010/STAND_ENTRY_EXIT_CAMERA_G_STAND_LOWER_ENTRY10',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.4.4_23.jpg'],
  'top': 3733,
  'left': 5700},
 {'name': 'H STAND UPPER ENTRY11',
  'type': 'STAND ENTRY & EXIT CAMERA',
  'url': 'http://107.170.54.225:5010/STAND_ENTRY_EXIT_CAMERA_H_STAND_UPPER_ENTRY11',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.4.4_2.jpg'],
  'top': 3439,
  'left': 4140},
 {'name': 'H STAND LOWER ENTRY12',
  'type': 'STAND ENTRY & EXIT CAMERA',
  'url': 'http://107.170.54.225:5010/STAND_ENTRY_EXIT_CAMERA_H_STAND_LOWER_ENTRY12',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.5.2_5.jpg'],
  'top': 3833,
  'left': 4373},
 {'name': 'I STAND UPPER ENTRY13',
  'type': 'STAND ENTRY & EXIT CAMERA',
  'url': 'http://107.170.54.225:5010/STAND_ENTRY_EXIT_CAMERA_I_STAND_UPPER_ENTRY13',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.4.4_9.jpg'],
  'top': 4300,
  'left': 3100},
 {'name': 'I STAND LOWER ENTRY14',
  'type': 'STAND ENTRY & EXIT CAMERA',
  'url': 'http://107.170.54.225:5010/STAND_ENTRY_EXIT_CAMERA_I_STAND_LOWER_ENTRY14',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.2_18.jpg'],
  'top': 4419,
  'left': 3560},
 {'name': 'J STAND UPPER ENTRY15',
  'type': 'STAND ENTRY & EXIT CAMERA',
  'url': 'http://107.170.54.225:5010/STAND_ENTRY_EXIT_CAMERA_J_STAND_UPPER_ENTRY15',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.4.4_15.jpg'],
  'top': 5359,
  'left': 2700},
 {'name': 'J STAND LOWER ENTRY16',
  'type': 'STAND ENTRY & EXIT CAMERA',
  'url': 'http://107.170.54.225:5010/STAND_ENTRY_EXIT_CAMERA_J_STAND_LOWER_ENTRY16',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.2_19.jpg'],
  'top': 5366,
  'left': 3173},
 {'name': 'K STAND UPPER ENTRY17',
  'type': 'STAND ENTRY & EXIT CAMERA',
  'url': 'http://107.170.54.225:5010/STAND_ENTRY_EXIT_CAMERA_K_STAND_UPPER_ENTRY17',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.4.4_22.jpg'],
  'top': 6505,
  'left': 2879},
 {'name': 'K STAND LOWER ENTRY18',
  'type': 'STAND ENTRY & EXIT CAMERA',
  'url': 'http://107.170.54.225:5010/STAND_ENTRY_EXIT_CAMERA_K_STAND_LOWER_ENTRY18',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshots/192.168.5.2_19.jpg'],
  'top': 6265,
  'left': 3286},
 {'name': 'KMK Gallery Camera -1Level -2 upper Right side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_KMK_GALLERY_CAMERA_1LEVEL_2_UPPER_RIGHT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.9_15.jpg'],
  'top': 8321,
  'left': 5979},
 {'name': 'KMK Gallery Camera -2Level -2 upper Left  side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_KMK_GALLERY_CAMERA_2LEVEL_2_UPPER_LEFT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.9_16.jpg'],
  'top': 8299,
  'left': 5950},
 {'name': 'KMK Gallery Camera -3Level -2 upper Right side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_KMK_GALLERY_CAMERA_3LEVEL_2_UPPER_RIGHT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.9_17.jpg'],
  'top': 8319,
  'left': 5879},
 {'name': 'KMK Gallery Camera -4Level -2 upper Right side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_KMK_GALLERY_CAMERA_4LEVEL_2_UPPER_RIGHT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.9_18.jpg'],
  'top': 8225,
  'left': 5980},
 {'name': 'KMK Gallery Camera -5Level -2 upper Right side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_KMK_GALLERY_CAMERA_5LEVEL_2_UPPER_RIGHT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.9_19.jpg'],
  'top': 8156,
  'left': 5788},
 {'name': 'KMK Gallery Camera -6Level -2 upper Right side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_KMK_GALLERY_CAMERA_6LEVEL_2_UPPER_RIGHT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.9_20.jpg'],
  'top': 8020,
  'left': 5891},
 {'name': 'KMK Gallery Camera -7Level -2 upper Right side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_KMK_GALLERY_CAMERA_7LEVEL_2_UPPER_RIGHT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.9_21.jpg'],
  'top': 8218,
  'left': 5820},
 {'name': 'KMK Gallery Camera  -1Level -5 Down to Up Right side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_KMK_GALLERY_CAMERA_1LEVEL_5_DOWN_TO_UP_RIGHT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.5_27.jpg'],
  'top': 8240,
  'left': 5770},
 {'name': 'KMK Gallery Camera  -2Level -5 Down to Up Left side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_KMK_GALLERY_CAMERA_2LEVEL_5_DOWN_TO_UP_LEFT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.5_28.jpg'],
  'top': 8116,
  'left': 6111},
 {'name': 'STAND C -1Gallery PTZ Right view camera',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_C_1GALLERY_PTZ_RIGHT_VIEW_CAMERA',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.7_11.jpg'],
  'top': 6525,
  'left': 7340},
 {'name': 'STAND C -2UPPER Down to Up Right side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_C_2UPPER_DOWN_TO_UP_RIGHT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.7_12.jpg'],
  'top': 6718,
  'left': 7318},
 {'name': 'STAND C -3UPPER Down to Up Left side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_C_3UPPER_DOWN_TO_UP_LEFT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.7_13.jpg'],
  'top': 6740,
  'left': 7285},
 {'name': 'STAND D-1Gallery PTZ Left view camera',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_D1GALLERY_PTZ_LEFT_VIEW_CAMERA',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.7_23.jpg'],
  'top': 5345,
  'left': 7461},
 {'name': 'STAND D-2UPPER Down to Up Left side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_D2UPPER_DOWN_TO_UP_LEFT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.7_24.jpg'],
  'top': 5354,
  'left': 7472},
 {'name': 'STAND D-3UPPER Down to Up Right side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_D3UPPER_DOWN_TO_UP_RIGHT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.7_25.jpg'],
  'top': 5311,
  'left': 7511},
 {'name': 'STAND E-1Gallery PTZ Right view camera',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_E1GALLERY_PTZ_RIGHT_VIEW_CAMERA',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.8_4.jpg'],
  'top': 4861,
  'left': 7048},
 {'name': 'STAND E-2UPPER Down to Up Left side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_E2UPPER_DOWN_TO_UP_LEFT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.8_5.jpg'],
  'top': 4313,
  'left': 7164},
 {'name': 'STAND E-3UPPER Down to Up Right side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_E3UPPER_DOWN_TO_UP_RIGHT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.8_6.jpg'],
  'top': 4340,
  'left': 7169},
 {'name': 'STAND F-1UPPER Down to Up Left side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_F1UPPER_DOWN_TO_UP_LEFT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.8_21.jpg'],
  'top': 3265,
  'left': 6089},
 {'name': 'STAND F-2UPPER Down to Up Right side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_F2UPPER_DOWN_TO_UP_RIGHT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.8_22.jpg'],
  'top': 3267,
  'left': 6111},
 {'name': 'STAND G-1UPPER Down to Up Left side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_G1UPPER_DOWN_TO_UP_LEFT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.8_31.jpg'],
  'top': 3039,
  'left': 4855},
 {'name': 'STAND G-2UPPER Down to Up Right side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_G2UPPER_DOWN_TO_UP_RIGHT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.8_32.jpg'],
  'top': 3089,
  'left': 4783},
 {'name': 'STAND H-12F GALLERY Right view',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_H12F_GALLERY_RIGHT_VIEW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.4_4.jpg'],
  'top': 3458,
  'left': 3660},
 {'name': 'STAND H-2LOWER Left view',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_H2LOWER_LEFT_VIEW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.4_5.jpg'],
  'top': 3452,
  'left': 3670},
 {'name': 'STAND H-3UPPER Down to Up Left side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_H3UPPER_DOWN_TO_UP_LEFT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.4_6.jpg'],
  'top': 3557,
  'left': 3566},
 {'name': 'STAND H-4UPPER Down to Up Right side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_H4UPPER_DOWN_TO_UP_RIGHT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.4_7.jpg'],
  'top': 3580,
  'left': 3577},
 {'name': 'STAND I-1UPPER Down to Up Left side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_I1UPPER_DOWN_TO_UP_LEFT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.4_12.jpg'],
  'top': 4525,
  'left': 2657},
 {'name': 'STAND I-2UPPER Down to Up Right side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_I2UPPER_DOWN_TO_UP_RIGHT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.4_13.jpg'],
  'top': 4554,
  'left': 2756},
 {'name': 'STAND I-3UPPER Right view',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_I3UPPER_RIGHT_VIEW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.4_14.jpg'],
  'top': 4654,
  'left': 2728},
 {'name': 'STAND J-1UPPER Down to Up Left side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_J1UPPER_DOWN_TO_UP_LEFT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.4_19.jpg'],
  'top': 5811,
  'left': 2519},
 {'name': 'STAND J-2UPPER Down to Up Right side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_J2UPPER_DOWN_TO_UP_RIGHT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.4_20.jpg'],
  'top': 5788,
  'left': 2607},
 {'name': 'STAND J-3LOWER PTZ Right view',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_J3LOWER_PTZ_RIGHT_VIEW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.4_21.jpg'],
  'top': 5827,
  'left': 2497},
 {'name': 'STAND K-1UPPER Down to Up Left side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_K1UPPER_DOWN_TO_UP_LEFT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.4_26.jpg'],
  'top': 7014,
  'left': 2932},
 {'name': 'STAND K-2UPPER Down to Up Right side show',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_K2UPPER_DOWN_TO_UP_RIGHT_SIDE_SHOW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.4_27.jpg'],
  'top': 6981,
  'left': 2871},
 {'name': 'STAND K-3LOWER PTZ Left  view',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_K3LOWER_PTZ_LEFT_VIEW',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.4_28.jpg'],
  'top': 6997,
  'left': 3059},
 {'name': 'STAND K-4??',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_K4',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.4_29.jpg'],
  'top': 7146,
  'left': 2192},
 {'name': 'STAND D LOWER3',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_D_LOWER3',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.7_23.jpg'],
  'top': 5458,
  'left': 7037},
 {'name': 'STAND D LOWER4',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_D_LOWER4',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.7_24.jpg'],
  'top': 5437,
  'left': 7042},
 {'name': 'STAND H LOWER7',
  'type': 'GALLERY CAMERA',
  'url': 'http://107.170.54.225:5010/GALLERY_CAMERA_STAND_H_LOWER7',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.8_5.jpg'],
  'top': 3921,
  'left': 3996},
 {'name': 'PATTABIRAMAN GATE1',
  'type': 'CONCOURSE',
  'url': 'http://107.170.54.225:5010/CONCOURSE_PATTABIRAMAN_GATE1',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.5.2_1.jpg'],
  'top': 2254,
  'left': 4822},
 {'name': 'H STAND PASSAGE2',
  'type': 'CONCOURSE',
  'url': 'http://107.170.54.225:5010/CONCOURSE_H_STAND_PASSAGE2',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.5.2_2.jpg'],
  'top': 2967,
  'left': 3450},
 {'name': 'I & H PASSAGE3',
  'type': 'CONCOURSE',
  'url': 'http://107.170.54.225:5010/CONCOURSE_I_H_PASSAGE3',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.5.2_6.jpg'],
  'top': 3898,
  'left': 3081},
 {'name': 'I & J PASSAGE4',
  'type': 'CONCOURSE',
  'url': 'http://107.170.54.225:5010/CONCOURSE_I_J_PASSAGE4',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.5.2_10.jpg'],
  'top': 5139,
  'left': 2343},
 {'name': 'F STAND PASSAGE5',
  'type': 'CONCOURSE',
  'url': 'http://107.170.54.225:5010/CONCOURSE_F_STAND_PASSAGE5',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.5.2_21.jpg'],
  'top': 2798,
  'left': 6398},
 {'name': 'MEDIA ENTRY7',
  'type': 'CONCOURSE',
  'url': 'http://107.170.54.225:5010/CONCOURSE_MEDIA_ENTRY7',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.5.2_23.jpg'],
  'top': 3692,
  'left': 6541},
 {'name': 'STAND  I -2PASSAGE 2',
  'type': 'CONCOURSE',
  'url': 'http://107.170.54.225:5010/CONCOURSE_STAND_I_2PASSAGE_2',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.4_11.jpg'],
  'top': 4190,
  'left': 2392},
 {'name': 'STAND  K-1PASSAGE 1',
  'type': 'CONCOURSE',
  'url': 'http://107.170.54.225:5010/CONCOURSE_STAND_K1PASSAGE_1',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.4_24.jpg'],
  'top': 7192,
  'left': 2447},
 {'name': 'C STAND STORE2',
  'type': 'CONCOURSE',
  'url': 'http://107.170.54.225:5010/CONCOURSE_C_STAND_STORE2',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.5.3_15.jpg'],
  'top': 6679,
  'left': 7600},
 {'name': 'MCC OUT PASSAGE6',
  'type': 'CONCOURSE',
  'url': 'http://107.170.54.225:5010/CONCOURSE_MCC_OUT_PASSAGE6',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.5.3_27.jpg'],
  'top': 8278,
  'left': 3893},
 {'name': 'KMK STANDS CONCOURSE CAMERAS2',
  'type': 'CONCOURSE',
  'url': 'http://107.170.54.225:5010/CONCOURSE_KMK_STANDS_CONCOURSE_CAMERAS2',
  'snapshot_urls': ['https://randomdev.blob.core.windows.net/ipl-snapshot-all/192.168.4.5_30.jpg'],
  'top': 8628,
  'left': 6320}];

	const openModal = (url: string) => {
		// Make sure to preserve the fragment identifier in the URL
		selectedUrl = url + (url.includes('?') ? '&' : '?') + 'autoplay=1';
		isOpen = true;
	};

	const closeModal = () => {
		isOpen = false;
		selectedUrl = '';
	};

	// Setting the hovered block with a small intentional delay
	const handleMouseEnter = (block: any) => {
		clearTimeout(hoverTimeout);
		hoveredBlock = block;
	};

	// Adding a small delay before clearing the hover state to prevent flickering
	const handleMouseLeave = () => {
		clearTimeout(hoverTimeout);
		hoverTimeout = setTimeout(() => {
			hoveredBlock = null;
		}, 100); // Small delay to prevent flickering
	};

	// Function to handle camera clicks based on view mode
	const handleCameraClick = (block: any) => {
		if (viewMode === 'snap') {
			// In snap mode, set the activeBlock to display snapshots in the panel
			activeBlock = block;
		} else if (viewMode === 'camera') {
			// In camera mode, set activeBlock for camera view
			activeBlock = block;
		}
	};

	// Function to handle the "VIEW" button click in snap mode
	const handleOpenFullVideo = () => {
		if (activeBlock) {
			openModal(activeBlock.url);
		}
	};

	// Function to construct the camera URL with proper fragment handling
	function getCameraUrl(url: string): string {
		// For URLs with hash fragments, we need to ensure they're preserved
		// First add autoplay parameter without disrupting the hash
		let baseUrl = url;
		const hasHashIndex = url.indexOf('#');
		const hashPart = hasHashIndex >= 0 ? url.substring(hasHashIndex) : '';

		if (hasHashIndex >= 0) {
			baseUrl = url.substring(0, hasHashIndex);
		}

		// Add autoplay parameter
		const autoplayParam = 'autoplay=1';
		if (baseUrl.includes('?')) {
			baseUrl += '&' + autoplayParam;
		} else {
			baseUrl += '?' + autoplayParam;
		}

		// Re-add the hash part
		return baseUrl + hashPart;
	}

	// Get the container dimensions to calculate scaling ratio
	let stadiumMapWidth = 0;
	let stadiumMapHeight = 0;
	let mapContainer: HTMLElement;

	// Original dimensions of the map image where the pixel coordinates were calculated
	const originalMapWidth = 12000; // Assuming this is the width of the original map (adjust as needed)
	const originalMapHeight = 9000; // Assuming this is the height of the original map (adjust as needed)

	function updateMapDimensions() {
		if (mapContainer) {
			stadiumMapWidth = mapContainer.clientWidth;
			stadiumMapHeight = mapContainer.clientHeight;
		}
	}

	// Calculate scaled position based on original pixel coordinates
	function calculateScaledPosition(position: number, originalSize: number, newSize: number) {
		return (position / originalSize) * 100; // Convert to percentage for responsive positioning
	}

	// Toggle between snap and camera modes
	function setViewMode(mode: 'snap' | 'camera') {
		viewMode = mode;
		// Keep activeBlock when switching modes for better user experience
	}
	let scale = 1;
	let posX = 0;
	let posY = 0;

	const minScale = 1;
	const maxScale = 4;

	function handleWheel(event) {
		event.preventDefault();
		const rect = event.currentTarget.getBoundingClientRect();

		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;

		const prevScale = scale;
		const delta = event.deltaY < 0 ? 1 : -1;
		const zoomStep = 0.1;

		scale += delta * zoomStep;
		scale = Math.min(Math.max(scale, minScale), maxScale);

		// Zoom focus around mouse cursor
		const ratio = scale / prevScale;
		posX = mouseX - (mouseX - posX) * ratio;
		posY = mouseY - (mouseY - posY) * ratio;

		// Reset to default when zooming out fully
		if (scale === 1) {
			posX = 0;
			posY = 0;
		}
	}
</script>

<svelte:window on:resize={updateMapDimensions} />
<div class="flex w-full flex-col overflow-auto p-4 sm:p-6 md:p-8 mt-10 lg:p-5">
	<!-- Main content with responsive layout -->
	<div class="flex flex-col gap-4 sm:gap-6 lg:flex-row">
		<!-- Left side: Stadium map with cameras - takes more space on larger screens -->
		<div
			class="lg:w-2.5/5 relative w-full overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800"
			on:wheel={handleWheel}
		>
			<!-- Scaled content -->
			<div
				style="
                transform: translate({posX}px, {posY}px) scale({scale});
                transform-origin: 0 0;
                width: 100%;
                height: 100%;
                position: relative;
                transition: transform 0.05s linear;
            "
			>
				<img
					src="/stadium2.png"
					alt="Stadium Map"
					class="h-auto w-full invert-0 dark:invert"
					bind:this={mapContainer}
				/>

				<!-- Camera overlays -->
				<div class="pointer-events-none absolute left-0 top-0 h-full w-full">
					{#each blockData as block (block.name)}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="pointer-events-auto absolute z-10 cursor-pointer"
							style="
                            top: {calculateScaledPosition(
								block.top,
								originalMapHeight,
								stadiumMapHeight
							)}%;
                            left: {calculateScaledPosition(
								block.left,
								originalMapWidth,
								stadiumMapWidth
							)}%;
                            transform: translate(-50%, -50%);
                        "
							title={block.name}
							on:click={() => handleCameraClick(block)}
							on:mouseenter={() => handleMouseEnter(block)}
							on:mouseleave={handleMouseLeave}
						>
							<img
								src="/camera-lens.png"
								alt={block.name}
								class={`block h-4 w-4 origin-center transform transition-transform duration-200 ease-in-out hover:scale-110 dark:invert ${activeBlock === block ? 'rounded-full ring-2 ring-blue-500' : ''}`}
							/>
						</div>
					{/each}
				</div>
			</div>
		</div>
		<!-- Right side: Snapshots container - fixed width on larger screens, full width on smaller -->
		<div
			class="lg:w-2.5/5 flex h-[450px] w-full flex-col rounded-lg p-4 shadow-md sm:h-[500px] lg:h-auto"
		>
			<!-- Add toggle buttons for Snap and Camera -->
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-base font-semibold sm:text-lg">Camera View</h3>
				<div class="flex space-x-2">
					<button
						class={`rounded px-2 py-1 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${viewMode === 'snap' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
						on:click={() => setViewMode('snap')}
					>
						Snap
					</button>
					<button
						class={`rounded px-2 py-1 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${viewMode === 'camera' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
						on:click={() => setViewMode('camera')}
					>
						Camera
					</button>
				</div>
			</div>

			<div class="relative flex-1 overflow-y-auto">
				<!-- Snapshot view mode -->
				{#if viewMode === 'snap'}
					{#if activeBlock && activeBlock.snapshot_urls && activeBlock.snapshot_urls.length > 0}
						<div class="space-y-4 transition-opacity duration-300">
							<div class="flex items-center justify-between">
								<h4 class="text-sm font-medium text-blue-600 sm:text-base">{activeBlock.name}</h4>
								<!-- <button
									class="rounded bg-blue-500 px-2 py-1 text-xs text-white transition-colors hover:bg-blue-700 sm:px-3"
									on:click={handleOpenFullVideo}
								>
									VIEW LIVE
								</button> -->
							</div>
							<div class="grid grid-cols-1 gap-3">
								{#each activeBlock.snapshot_urls as snapshotUrl, index}
									<div class="overflow-hidden rounded-md border border-gray-100">
										<img
											src={snapshotUrl}
											alt={`${activeBlock.name} Snapshot ${index + 1}`}
											class="w-full object-cover transition-all duration-300"
										/>
									</div>
								{/each}
							</div>
						</div>
					{:else}
						<div
							class="flex h-40 items-center justify-center text-gray-500 transition-opacity duration-300"
						>
							Click on a camera to view snapshots
						</div>
					{/if}
					<!-- Camera view mode -->
				{:else if viewMode === 'camera'}
					{#if activeBlock}
						<div class="flex h-full flex-col">
							<h4 class="mb-3 text-sm font-medium text-blue-600 sm:text-base">
								{activeBlock.name} - Live Feed
							</h4>
							<div class="min-h-0 flex-1 overflow-hidden">
								<div class="-mb-5 -ml-16 h-[calc(100%+40px)] w-[calc(100%+30px)]">
									<iframe
										class="h-full w-full rounded-md border-0"
										src={getCameraUrl(activeBlock.url)}
										title="Camera Feed"
										frameborder="0"
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
										allowfullscreen
									></iframe>
								</div>
							</div>
						</div>
					{:else}
						<div
							class="flex h-40 items-center justify-center text-gray-500 transition-opacity duration-300"
						>
							Click on a camera to view live feed
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>
</div>
