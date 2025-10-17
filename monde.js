import * as THREE from 'three';
import { PRIMS3D } from './prims3d.js';
import { ACTEURS } from './acteurs.js';
import { COMPS } from './composants.js';

class Monde {
    constructor(simu) {
        this.simu = simu;
        this.scene = simu.scene;
        this.assets = {};
    }

    enregistrer(nom, v) { this.assets[nom] = v; }
    chercher(nom, defaut) { return (this.assets[nom] || (defaut || null)); }
    genese() {
        // === Palette ===
        const palette = {
            sol: 0xE6D5B8,
            murExterieur: 0xC9C9C9,
            murInterieur: 0xF2F2F2,
            hall: 0xE8CFAE,
            salle: 0xA5C9CA,
            sphere: 0xB5E48C,
            porte: 0x6B4F3B,
            cadrePorte: 0xC19A6B,
            texte: 0x000000,
            plafond: 0xF5F5F5 // blanc cassé
        };

        // === Lumière ambiante globale ===
        const lightAmb = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(lightAmb);

        // === Sol principal (20 x 20) ===
        const solGeo = new THREE.PlaneGeometry(20, 20);
        const solMat = new THREE.MeshStandardMaterial({ color: palette.sol, roughness: 0.8, metalness: 0.2 });
        const sol = new THREE.Mesh(solGeo, solMat);
        sol.rotation.x = -Math.PI / 2;
        sol.position.y = 0;
        this.scene.add(sol);

        // === MURS EXTÉRIEURS ===
        const murMat = new THREE.MeshStandardMaterial({ color: palette.murExterieur, roughness: 0.8 });
        const murGeo = new THREE.BoxGeometry(0.2, 4, 20);

        const murEst = new THREE.Mesh(murGeo, murMat);
        murEst.position.set(10, 2, 0);
        this.scene.add(murEst);

        const murOuest = new THREE.Mesh(murGeo, murMat);
        murOuest.position.set(-10, 2, 0);
        this.scene.add(murOuest);

        const murNord = new THREE.Mesh(new THREE.BoxGeometry(20, 4, 0.2), murMat);
        murNord.position.set(0, 2, -10);
        this.scene.add(murNord);

        const murSud = new THREE.Mesh(new THREE.BoxGeometry(20, 4, 0.2), murMat);
        murSud.position.set(0, 2, 10);
        this.scene.add(murSud);

        // === MURS INTÉRIEURS ===
        const murIntMat = new THREE.MeshStandardMaterial({ color: palette.murInterieur });
        const zMur = -5;

        const murGauche = new THREE.Mesh(new THREE.BoxGeometry(5.55, 4, 0.2), murIntMat);
        murGauche.position.set(-8, 2, zMur);
        this.scene.add(murGauche);

        const murMilieu = new THREE.Mesh(new THREE.BoxGeometry(4.9, 4, 0.2), murIntMat);
        murMilieu.position.set(1, 2, zMur);
        this.scene.add(murMilieu);

        const murDroite = new THREE.Mesh(new THREE.BoxGeometry(5.4, 4, 0.2), murIntMat);
        murDroite.position.set(8, 2, zMur);
        this.scene.add(murDroite);

        // === PORTES ===
        const porteLargeur = 1.5;
        const porteHauteur = 2.2;
        const porteEpaisseur = 0.08;
        const yPorte = porteHauteur / 2;
        const xPortes = [-4.3, -2.35, 4.4];

        xPortes.forEach((xPos, index) => {
            const cadreGeo = new THREE.BoxGeometry(porteLargeur + 0.3, porteHauteur + 0.3, porteEpaisseur);
            const cadreMat = new THREE.MeshStandardMaterial({ color: palette.cadrePorte });
            const cadre = new THREE.Mesh(cadreGeo, cadreMat);
            cadre.position.set(xPos, yPorte, zMur + 0.1);
            this.scene.add(cadre);

            const porteGeo = new THREE.BoxGeometry(porteLargeur, porteHauteur, porteEpaisseur / 2);
            const porteMat = new THREE.MeshStandardMaterial({ color: palette.porte });
            const porte = new THREE.Mesh(porteGeo, porteMat);
            porte.position.set(xPos, yPorte, zMur + 0.15);
            this.scene.add(porte);

            // Titre
            const titreTexte = `Salle ${index + 1}`;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 64;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(titreTexte, canvas.width / 2, canvas.height / 2);
            const texture = new THREE.CanvasTexture(canvas);

            const panneauGeo = new THREE.PlaneGeometry(2, 0.6);
            const panneauMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
            const panneau = new THREE.Mesh(panneauGeo, panneauMat);
            panneau.position.set(xPos, porteHauteur + 0.5, zMur + 0.2);
            this.scene.add(panneau);
        });

        // === Séparation entre les 3 salles (Nord) ===
        const murSalle1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 10), murIntMat);
        murSalle1.position.set(-3.33, 2, -10);
        this.scene.add(murSalle1);

        const murSalle2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 10), murIntMat);
        murSalle2.position.set(3.33, 2, -10);
        this.scene.add(murSalle2);

        // === Sols ===
        const hallGeo = new THREE.PlaneGeometry(20, 10);
        const hallMat = new THREE.MeshStandardMaterial({ color: palette.hall, roughness: 0.8 });
        const hallSol = new THREE.Mesh(hallGeo, hallMat);
        hallSol.rotation.x = -Math.PI / 2;
        hallSol.position.set(0, 0.01, 5);
        this.scene.add(hallSol);

        const sallesGeo = new THREE.PlaneGeometry(20, 10);
        const sallesMat = new THREE.MeshStandardMaterial({ color: palette.salle });
        const sallesSol = new THREE.Mesh(sallesGeo, sallesMat);
        sallesSol.rotation.x = -Math.PI / 2;
        sallesSol.position.set(0, 0.01, -5);
        this.scene.add(sallesSol);

        // === PLAFOND ===
        const plafondGeo = new THREE.PlaneGeometry(20, 20);
        const plafondMat = new THREE.MeshStandardMaterial({ color: palette.plafond, roughness: 0.9 });
        const plafond = new THREE.Mesh(plafondGeo, plafondMat);
        plafond.rotation.x = Math.PI / 2;
        plafond.position.y = 4; // même hauteur que les murs
        this.scene.add(plafond);

        // === LAMPES ===
        const sphereLampGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const lampMat = new THREE.MeshStandardMaterial({ emissive: 0xffffcc, emissiveIntensity: 1, color: 0xffffff });

        // Grande lampe dans le hall
        const lampHall = new THREE.Mesh(sphereLampGeo, lampMat);
        lampHall.position.set(0, 3.8, 5);
        this.scene.add(lampHall);

        const lightHall = new THREE.PointLight(0xffffff, 1.5, 30);
        lightHall.position.copy(lampHall.position);
        this.scene.add(lightHall);

        // Petites lampes dans chaque salle
        const salleCenters = [-7, -5, -3]; // z moyen de chaque salle
        const xSalles = [-6.5, 0, 6.5];

        xSalles.forEach((x, i) => {
            const lamp = new THREE.Mesh(sphereLampGeo, lampMat);
            lamp.scale.set(0.6, 0.6, 0.6);
            lamp.position.set(x, 3.8, -5);
            this.scene.add(lamp);

            const light = new THREE.PointLight(0xffffff, 0.8, 15);
            light.position.copy(lamp.position);
            this.scene.add(light);
        });

        // === SPHÈRE décorative ===
        const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
        const sphereMat = new THREE.MeshStandardMaterial({ color: palette.sphere });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.set(0, 1, 0);
        this.scene.add(sphere);

        // === TABLEAUX ===
        const textureLoader = new THREE.TextureLoader();
        const images = [
            "./assets/images/tableau1.jpg",
            "./assets/images/tableau2.jpg",
            "./assets/images/tableau3.jpg",
            "./assets/images/tableau4.jpg",
            "./assets/images/tableau5.jpg",
            "./assets/images/MAN001jpg"
        ];

        let imageIndex = 0;
        for (let s = 0; s < 3; s++) {
            const xSalle = -6.5 + s * 6.5;
            const zMurNord = -9.9;
            for (let t = 0; t < 2; t++) {
                const tex = textureLoader.load(images[imageIndex % images.length]);
                imageIndex++;
                const posterGeo = new THREE.PlaneGeometry(2, 2);
                const posterMat = new THREE.MeshStandardMaterial({ map: tex });
                const poster = new THREE.Mesh(posterGeo, posterMat);
                poster.position.set(xSalle + (t - 0.5) * 2.5, 2, zMurNord + 0.1);
                this.scene.add(poster);
            }
        }

        // === Helpers ===
        const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x999999);
        this.scene.add(gridHelper);
    }

}
export { Monde };
