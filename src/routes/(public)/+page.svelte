<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import {
		PawPrint,
		Download,
		Smartphone,
		Bell,
		MapPin,
		Heart
	} from '@lucide/svelte';
	import logo from '$lib/assets/icon.png';
	import Pet from '$lib/components/feed/pet.svelte';
	import RandomText from '$lib/components/feed/random-text.svelte';
	import '../../css/animations.css';
	import { onMount } from 'svelte';
	import PetScene from '$lib/components/feed/pet-scene.svelte';

	const TEXTOS_ALEATORIOS = [
		"Bien gracias y tu?",
		"Hola no se como llegué aquí",
		"Puro exitoso desarrolló esta app",
		"Y perry?",
		"Hola",
		"Por favor hermano descarga la app",
		"Buenas dias, tardes o noches",
		"Los que saben:"
	];

	let textoAleatorio = $state(TEXTOS_ALEATORIOS[0]);

	const apkUrl = '/downloads/PatitasAlRescateReleasev1.1.apk';
	const apkSize = '8.1 MB';

	const SHITPOST_IMAGES = [
		'ase%20frio.jpg',
		'baca%20(2).jpeg',
		'caballo.jpg',
		'cocodrilo.jpeg',
		'descargar.jpg',
		'gato%20(2).jpeg',
		'gato%20(3).jpeg',
		'gato%20(5).jpeg',
		'gato%20(8).jpeg',
		'oso.jpg',
		'pato.jpeg',
		'penguin.jpg',
		'slungus.png',
		'tanque.png',
		'yeehaw.jpg'
	];

	function shitpostUrl(file: string) {
		return `/images/shitpost/${file}`;
	}

	function randomImage(except?: string) {
		const options = SHITPOST_IMAGES.filter((img) => img !== except);
		return options[Math.floor(Math.random() * options.length)];
	}

	let leftImg = $state('penguin.jpg');
	let rightImg = $state('penguin.jpg');

	const PENGUIN_ANIMATIONS = [
		'Rotate-IMG',
		'Image-FlipY',
		'Image-FlipX',
		'Maxwell-Anim'
	];
	const img_class = "rounded-md object-cover shadow-xl w-40 lg:w-56 dark:border-zinc-800";

	function randomAnimation(except?: string) {
		const options = PENGUIN_ANIMATIONS.filter((a) => a !== except);
		return options[Math.floor(Math.random() * options.length)];
	}

	let leftAnim = $state('Floaty');
	let rightAnim = $state('Jiggle-Infinite');

	onMount(() => {
		leftAnim = randomAnimation();
		rightAnim = randomAnimation(leftAnim);
		leftImg = randomImage();
		rightImg = randomImage(leftImg);
		textoAleatorio =
			TEXTOS_ALEATORIOS[Math.floor(Math.random() * TEXTOS_ALEATORIOS.length)];
	});

	const features = [
		{
			icon: PawPrint,
			title: 'Explorá mascotas',
			description: 'Mirá perfiles con fotos, temperamento e historia de cada rescatado.'
		},
		{
			icon: Heart,
			title: 'Adoptá fácil',
			description: 'Iniciá tu solicitud de adopción en minutos desde el celu.'
		},
		{
			icon: MapPin,
			title: 'Refugios cerca',
			description: 'Encontrá refugios y eventos de adopción alrededor tuyo.'
		},
		{
			icon: Bell,
			title: 'Avisos',
			description: 'Enterate cuando llegue un nuevo peludo compatible con vos.'
		}
	];
</script>

<svelte:head>
	<title>Patitas al Rescate</title>
	<meta
		name="description"
		content="Descargá el APK de Patitas al Rescate para Android y adoptá tu próxima mascota."
	/>
</svelte:head>

<div class="flex flex-col gap-16 pb-12">
	<section style="
		background-image: url(/images/background_main.png);
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;"

		class="relative -mx-4 -mt-4 overflow-hidden px-4 py-10 md:px-8 md:py-16">
		<div class="absolute inset-0 bg-black/60" aria-hidden="true"></div>
		<div class="relative mx-auto flex max-w-6xl items-center justify-center gap-6 md:gap-10">
			<button
				type="button"
				onclick={() => {
					leftAnim = randomAnimation(leftAnim);
					leftImg = randomImage(leftImg);
				}}
				class="hidden shrink-0 cursor-pointer md:block"
				title="¡Tocame! Cambio de imagen y animación"
			>
				<img
					src={shitpostUrl(leftImg)}
					alt="Meme de Patitas"
					class={img_class + ' ' + leftAnim}
				/>
			</button>
			<div class="relative mx-auto w-full max-w-sm">
				<div class="absolute -top-6 -right-6 hidden h-32 w-32 rounded-full bg-orange-200/50 blur-3xl md:block dark:bg-orange-800/20"></div>
				<div class="relative overflow-hidden rounded-4xl border bg-card p-6 shadow-2xl shadow-orange-900/10">
					<div class="flex flex-col items-center gap-4 text-center">
						<PetScene>
							<Pet  />
							<Pet  />
							<Pet  />
						</PetScene>
						<img src={logo} alt="Patitas al Rescate" class="size-28 rounded-3xl object-contain shadow-md" />
						<div>
							<p class="text-xl font-bold">Patitas al Rescate</p>
						</div>
						<div class="flex gap-2">
							<Badge class="rounded-full bg-emerald-600 hover:bg-emerald-700"><Smartphone /> Solo android</Badge>
							<Badge variant="secondary" class="rounded-full">{apkSize}</Badge>
						</div>
						<RandomText texto={textoAleatorio} velocidad={60} />
						<Button
							href={apkUrl}
							download="PatitasAlRescateReleasev1.1.apk"
							class="w-full gap-2 rounded-full bg-orange-600 hover:bg-orange-700"
						>
							<Download class="h-4 w-4" />
							Descargar ahora
						</Button>
						<span class="font-mono text-xs">PatitasAlRescateReleasev1.1.apk</span>
						<PetScene>
							<Pet />
							<Pet />
						</PetScene>
					</div>
				</div>
			</div>
			<button
				type="button"
				onclick={() => {
					rightAnim = randomAnimation(rightAnim);
					rightImg = randomImage(rightImg);
				}}
				class="hidden shrink-0 cursor-pointer md:block"
				title="¡Tocame! Cambio de imagen y animación"
			>
				<img
					src={shitpostUrl(rightImg)}
					alt="Meme de Patitas"
					class={img_class + ' ' + rightAnim}
				/>
			</button>
		</div>
	</section>

	<section class="mx-auto flex w-full max-w-6xl flex-col gap-8">
		<div class="text-center">
			<Badge variant="outline" class="rounded-full bg-white dark:bg-card">¿Qué trae la app?</Badge>
			<h2 class="mt-3 text-3xl font-bold tracking-tight">Empieza a adoptar mascotas</h2>
			<p class="mx-auto mt-2 max-w-xl text-muted-foreground">
				Las mismas funciones de la plataforma, optimizadas para Android.
			</p>
		</div>

		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each features as feature (feature.title)}
				<Card.Root class="rounded-2xl border-0 shadow-sm">
					<Card.Header>
						<div class="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
							<feature.icon class="h-5 w-5" />
						</div>
						<Card.Title class="text-lg">{feature.title}</Card.Title>
						<Card.Description>{feature.description}</Card.Description>
					</Card.Header>
				</Card.Root>
			{/each}
		</div>
	</section>
</div>
