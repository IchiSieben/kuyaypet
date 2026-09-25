# Motor de compatibilidad “KuyayMatch” (propuesta para el prototipo)

Las HU no definen fórmula (HU-20 solo pide “nivel de compatibilidad” y “criterios que la originaron”).
Esta es una propuesta **transparente y explicable** — nada de caja negra: cada punto del score debe poder mostrarse como una razón en la UI.
Implementar como función pura `computeMatch(adopter, pet) → { score: 0-100, reasons: Reason[], warnings: Reason[], hardBlock?: string }` con tests.

## Entradas

**Perfil del adoptante (cuestionario de onboarding, 6–8 pantallas tipo Bumble/Tinder, una pregunta por pantalla):**
| Campo | Valores |
|---|---|
| ubicación | distrito de Lima (lat/lng del centroide) o geolocalización del navegador |
| radioKm | 1–20 |
| vivienda | departamento · casa sin patio · casa con patio/jardín |
| tamañoVivienda | pequeña · mediana · grande |
| horasSolo | horas al día que la mascota estaría sola (0–2, 3–5, 6–8, 8+) |
| actividad | sedentario · moderado · muy activo (corre, hace trekking) |
| experiencia | primera mascota · he tenido · experto |
| niños | no · niños > 6 años · niños pequeños |
| otrasMascotas | ninguna · perro · gato · ambos |
| alergias | sí/no → preferir hipoalergénicos |
| preferencias | especie, tamaño, rango de edad, sexo (filtros suaves) |

**Perfil de la mascota:** especie, raza, edad (meses), tamaño (S/M/L), sexo, energía (1–5), sociableConNiños, sociableConPerros, sociableConGatos, necesitaPatio, toleraSoledad (1–5), apto primerizo, hipoalergénico, esterilizada, vacunada, lat/lng, personalidad (tags).

## Puntaje (100 pts) — pesos iniciales, ajustables en `src/lib/match/weights.ts`
| Factor | Peso | Lógica |
|---|---|---|
| Cercanía | 20 | 20 si ≤ 2 km; decae linealmente hasta 0 en el radio del usuario (Haversine) |
| Vivienda ↔ tamaño/energía | 20 | depa + perro L de energía 5 = bajo; casa con patio + perro activo = alto; gatos casi neutros |
| Estilo de vida ↔ energía | 15 | diferencia entre actividad del adoptante y energía de la mascota |
| Tiempo disponible ↔ tolerancia a soledad | 15 | horasSolo vs toleraSoledad |
| Hogar (niños, otras mascotas) | 15 | sociabilidad cruzada; incompatibilidad fuerte → warning |
| Experiencia | 10 | mascota “no apta primerizos” con adoptante primerizo → penaliza |
| Preferencias explícitas | 5 | especie/tamaño/edad/sexo coinciden |

**Bloqueos duros (score = 0, no se muestra en el deck):** mascota no disponible / no aprobada; especie excluida por el usuario; alergia + no hipoalergénico (mostrar como warning si el usuario lo permite); fuera del radio.

## Razones legibles (mostrar en tarjeta y perfil — cumple HU-20 CA-4)
Ejemplos que la UI debe generar a partir de los factores:
- 📍 “A 1.8 km de ti (Miraflores)”
- 🏡 “Ideal para departamento: tamaño pequeño y energía tranquila”
- ⚡ “Su energía (4/5) encaja con tu estilo muy activo”
- 👶 “Se lleva bien con niños”
- ⚠️ “Necesita compañía: tú estarías fuera 8+ h al día”

## Match (HU-07) — interés mutuo
1. Adoptante da “Me gusta” (swipe derecha) → se crea `Interest(pending)` y se notifica al responsable (HU-13).
2. Responsable acepta → `Match` + animación “¡Es un Match!” + se abre chat (HU-08).
3. **En la demo**: cada responsable sintético tiene `autoAcceptProbability` (0.3–0.9) y un delay de 2–6 s; así se ve el Match en vivo durante la presentación. El modo presentador puede forzar “Match garantizado” para la siguiente carta.
4. “Súper Kuyay” (like destacado, 1 al día) → notificación prioritaria al responsable. Opcional, da juego en la demo.

## Orden del deck
`score desc`, con un poco de aleatoriedad (±5) para que no siempre salgan los mismos primero, y excluyendo ya vistos (historial HU-18).

## Honestidad del prototipo
Los pesos son heurísticos, no validados con datos reales. En la pantalla “Cómo funciona” decirlo así: *“Fase 2: calibrar los pesos con resultados reales de adopciones exitosas.”*
