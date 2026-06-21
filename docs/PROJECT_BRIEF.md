# Aethermarch — Project Brief

> Documento de referencia maestro. No es una lista de tareas. Es la memoria del proyecto.
> Para diseño de mundo, estratos, facciones, lugares, NPCs y reglas de contenido, ver `docs/WORLD_BIBLE.md`.

---

## Concepto Central

**Aethermarch** es un RPG móvil de exploración basado en pasos reales.

La fantasía principal no es "contar pasos". Es:

> "Cada paseo real hace descender mi expedición por un Abismo medieval oscuro, estrato tras estrato."

El jugador camina en la vida real → su caravana desciende por un mundo subterráneo antiguo y peligroso → descubre nuevos estratos, lucha, recolecta, progresa, contrata mercenarios, revela secretos.

La escala no es horizontal. Es vertical. La profundidad es el progreso.

---

## Identidad Visual

**Tono:** fantasía medieval oscura, magia antigua, viaje de caravana hacia lo desconocido.

**No es:** app de fitness, copia de Pokémon GO, Monster Hunter Now, Fantasy Hike, RPG genérico, interfaz futurista, sci-fi.

### Paleta de colores

| Token | Hex |
|---|---|
| Fondo noche | `#070807` |
| Negro cálido | `#0E0B08` |
| Cuero oscuro | `#2A1A10` |
| Cuero medio | `#3A2618` |
| Madera oscura | `#4B321F` |
| Hierro viejo | `#5A5F61` |
| Hierro oscuro | `#383D3F` |
| Piedra fría | `#2F3437` |
| Piedra clara apagada | `#626B6F` |
| Pergamino viejo | `#C8B88A` |
| Dorado envejecido | `#B8944A` |
| Brasa | `#D46A2D` |
| Brasa oscura | `#8A3F1D` |
| Rojo HP | `#D62828` |
| Verde XP | `#3FA34D` |
| Azul mágico apagado | `#4F8F95` |
| Azul niebla | `#6F9FA3` |
| Violeta rúnico | `#6D5A9C` |

**Prohibidos como principal:** `#00FFFF`, `#00E5FF`, `#39FF14`, `#FF00FF`, azul eléctrico, verde ácido, rosa neón.

### Elementos visuales base
Madera oscura · cuero envejecido · hierro viejo · piedra fría · pergamino · brasas · fuego · runas · faroles · caminos de tierra · raíces · niebla · bosques · ruinas · forjas · cristales naturales · sombras · muros de piedra húmeda · hongos bioluminiscentes · grietas profundas · escaleras de roca rota.

### Magia (Aether)
Representar como: runas tenues, cristales naturales, polvo mágico, brasas azules apagadas, niebla encantada, sellos antiguos, marcas en piedra.
**Nunca como:** láser, neón, holograma, circuito, interfaz tecnológica.

### Gráficos en prototipo
Solo: React + CSS + SVG inline + divs + gradientes + sombras + animaciones CSS.
Sin imágenes externas, sin assets externos, sin librerías visuales.

Cada token visual debe tener: silueta clara · rasgo principal reconocible · detalle de identidad.

---

## Tipos de Jugador

### Jugador Pasivo
Inicia expedición → guarda el móvil → camina → vuelve → revisa diario, botín, progreso.
No debe perder recompensas importantes por no mirar la pantalla.

### Jugador Activo
Mira el móvil mientras camina → ve la caravana descender, eventos, combates, recolección.
Recibe más espectáculo y decisiones ligeras, pero no es obligatorio.

**Regla central:** Mirar el móvil debe ser entretenido, pero no obligatorio. Sin reflejos rápidos. Sin eventos perdibles críticos.

---

## Loop Principal (Futuro Completo)

1. Elegir arquetipo
2. Elegir criatura inicial
3. Preparar caravana
4. Alzar la caravana ← primer botón narrativo
5. Descender por el estrato activo
6. Ver eventos de marcha (recursos, exploración, criatura, amenaza, microevento)
7. Recolectar recursos
8. Entrar en combates
9. Encontrar contratables durante el descenso
10. Completar tramo → resumen de descenso
11. Actualizar diario e inventario
12. Subir dominio del estrato
13. Desbloquear acceso al siguiente estrato cuando se cumplan requisitos
14. Continuar descenso

Los tramos son consecutivos (Tramo 1 → Tramo 2 → …) dentro de un estrato, y también entre estratos. La profundidad acumulada es el indicador de progreso global.

---

## El Abismo

El Abismo es la estructura principal del mundo. Está formado por estratos descendentes conectados por rutas, pasos, túneles, cornisas, ruinas, campamentos, zonas secretas y biomas extremos.

El jugador no conquista un mapa horizontal tradicional, sino que va abriendo capas cada vez más profundas. Cada estrato debe sentirse como una frontera nueva, con recursos, criaturas, amenazas y secretos propios.

El descenso no es reversible fácilmente. Algunos estratos pueden necesitar preparación, equipo o contratables especiales para acceder. La profundidad genera tensión natural: cuanto más se baja, mayor es el peligro y mayor es la recompensa.

### Ejemplos de estratos (provisionales, no definitivos)

| Profundidad | Nombre | Bioma |
|---|---|---|
| 1 | Linde de Raíz | Raíces antiguas, tierra húmeda, hongos pequeños |
| 2 | Corredor de Esporas | Hongos luminosos, niebla de esporas, túneles estrechos |
| 3 | Cuenca de Resina | Resina endurecida, brasas enterradas, colonias |
| 4 | Cámara de las Hormigas de Fuego | Túneles rojizos, resina ardiente, colonias subterráneas |
| 5 | Ruinas Sumergidas | Piedra antigua bajo agua oscura, runas casi borradas |
| 6 | Desierto de Hielo | Viento helado, cristales de hielo, silencio |
| 7 | Forjas Enterradas | Hierro vivo, magma contenido, constructos durmientes |
| 8 | Huesos Colosales | Esqueletos de criaturas antiguas, cavernas enormes |
| 9 | Campo de Cristal Vivo | Cristales que crecen, resuenan y cortan |
| ∞ | Fondo del Abismo | Desconocido. Nadie ha vuelto igual. |

Estos ejemplos son provisionales. El número de estratos y su orden se definirá durante el diseño de contenido.

### Estructura futura de una zona

```js
{
  id: "stratum_01_root_edge",
  stratumId: "stratum_01",
  depthLevel: 1,
  name: "Linde de Raíz",
  biomeId: "root_forest",
  discovered: true,
  secret: false,
  requiredAccess: null,
  resources: [],
  enemies: [],
  lootTier: 1,
  dangerRank: "low",
  connections: [],
  hiddenConnections: [],
  mercenaryEligible: true
}
```

Este modelo no está implementado todavía. Queda documentado como dirección futura.

---

## Estratos

Cada estrato funciona como una capa del Abismo.

### Campos de cada estrato

- **nombre** — identidad narrativa del estrato
- **profundidad** — nivel numérico de descenso
- **bioma** — entorno visual y ambiental
- **peligro** — nivel de amenaza base (bajo / medio / alto / extremo)
- **loot tier** — calidad y rareza del botín
- **enemigos** — criaturas hostiles propias de ese nivel
- **recursos** — materiales obtenibles
- **secretos** — zonas ocultas, entradas, cámaras
- **requisitos de acceso** — equipo, rango, contratable, recurso o condición
- **eventos** — microeventos, encuentros, hallazgos
- **zonas especiales** — campamentos, ruinas, POIs subterráneos
- **contratables encontrables** — quién puede aparecer
- **entradas de enciclopedia** — qué se registra al visitar

### Ejemplo de diseño: Estrato 4 — Cámara de las Hormigas de Fuego

**Bioma:** túneles rojizos, resina ardiente, colonias subterráneas.

**Amenazas:**
- Hormiga de Fuego Obrera (daño bajo, en grupo)
- Hormiga de Fuego Soldado (daño medio, postura específica)
- Reina Larvaria (jefe de estrato, acceso por zona secreta)

**Loot:**
- Quitina Ardiente
- Núcleo de Resina
- Mandíbula Ígnea

**Secretos:**
- Galería sellada por resina — requiere herramienta disolvente
- Nido oculto accesible con armadura resistente al fuego
- Cámara lateral detectable por criatura rastreadora

Este ejemplo no es definitivo. Se elaborará durante diseño de contenido.

---

## Zonas Secretas

Las zonas secretas pueden existir dentro de cualquier estrato.

### Condiciones de acceso

Se accede a ellas mediante una o varias condiciones:

- ataque o arma específica
- armadura o protección especial
- mascota con habilidad concreta
- contratable con especialidad adecuada
- rango mínimo del jugador
- recurso especial en el inventario
- probabilidad modificada por dominio del estrato
- combinación de varias condiciones anteriores

### Ejemplos

- Una pared agrietada que requiere ataque contundente.
- Un túnel de esporas que requiere máscara o armadura filtrante.
- Una cueva de setas detectada por una mascota rastreadora.
- Un paso estrecho que solo encuentra un contratable explorador.
- Una puerta antigua que requiere rango o reliquia.
- Una galería de resina que solo se abre con Quitina Ardiente.

### Regla de diseño

No todo debe ser determinista. Algunas zonas aparecen por probabilidad modificada por mascota, equipo, rango o dominio del estrato. La incertidumbre es parte del atractivo.

---

## Mascotas y Exploración

Las mascotas no son decorativas. Afectan activamente el mundo:

- **probabilidad de encontrar recursos** — según bioma y especialidad
- **detección de zonas secretas** — especialmente rastreadores y criaturas de niebla
- **rastreo de enemigos** — adelantar amenazas, reducir sorpresa
- **acceso a rutas especiales** — físicas o mágicas
- **reducción de riesgo** — algunos estratos son más seguros con ciertas mascotas
- **hallazgos raros** — objetos únicos detectados por la criatura
- **eventos de vínculo** — momentos narrativos específicos de cada mascota

### Ejemplos de interacción mascota–estrato

| Mascota | Habilidad de exploración |
|---|---|
| Rastreador (perro) | Huele setas raras en estratos húmedos, revela zonas ocultas |
| Criatura ígnea | Acceso a resina endurecida, tolera calor extremo |
| Criatura de hielo | Permite cruzar zonas abrasadoras o congeladas |
| Criatura pesada | Puede romper muros o abrir pasos derrumbados |
| Velthar (actual) | Detecta rutas ocultas, mejora exploración en niebla |
| Brontik (actual) | Resiste impactos, puede abrir paso con cuerpo |
| Lúmora (actual) | Detecta cristales y recursos brillantes, ilumina oscuridad |

Este sistema se expandirá conforme se añadan nuevas mascotas y estratos.

---

## Subordinados y Contratos

El jugador puede encontrar durante sus marchas personajes que pueden ser contratados para expediciones automáticas.

### Nombres internos a evaluar

- Subordinados
- Mercenarios
- Exploradores
- Guías del Abismo
- Juramentados
- Contratados
- Compañeros de Contrato

*(Nombre definitivo pendiente de decisión de diseño.)*

### Función

El jugador puede contratar estos personajes y enviarlos a expediciones automáticas por tiempo real.

Ejemplos de contratos:
- Mandar un mercenario a un estrato conocido durante 2 horas
- Mandar un explorador a revisar una ruta ya descubierta
- Mandar un recolector a traer recursos de un estrato con loot tier bajo
- Mandar un guerrero a limpiar una zona de amenaza baja
- Mandar un rastreador a buscar una entrada secreta

### Variables de un contrato

- tiempo de duración (real)
- profundidad / estrato objetivo
- riesgo del contrato
- rango mínimo requerido
- especialidad del contratable
- coste de contratación
- probabilidad de éxito
- posibles consecuencias (herida, cansancio)
- loot esperado con rareza
- retorno con informe narrativo

### Sistema no implementado todavía.

---

## Rangos

El jugador tendrá un rango de explorador o expedicionario.

El rango sirve para:
- acceder a estratos más peligrosos
- contratar mejores subordinados
- aceptar contratos más largos
- desbloquear equipo avanzado
- aumentar reputación en el Abismo
- desbloquear permisos especiales
- acceder a zonas restringidas
- mejorar recompensas de contratos

Las fórmulas de progresión de rango se definirán más adelante.

**Sistema no implementado todavía.**

---

## Encuentros con Contratables

Durante la marcha, el jugador puede encontrar personajes contratables.

### Condiciones de aparición

- evento de exploración durante el descenso
- taberna o campamento subterráneo
- rescate tras combate
- zona secreta
- reputación acumulada
- rango del jugador
- azar controlado por bioma

### Estructura de un contratable

```js
{
  id: "merc_ivar_mushroom_hound",
  name: "Ivar, rastreador de esporas",
  rank: "II",
  specialty: "Hongos y túneles húmedos",
  contractRole: "secret_finder",
  bonus: "Aumenta la probabilidad de encontrar zonas de setas ocultas.",
  risk: "low"
}
```

Cada contratable puede tener: nombre, rango, clase, especialidad, coste, rasgo, riesgo, compatibilidad con estratos, probabilidad de éxito en contratos, historia breve.

**Sistema no implementado todavía.**

---

## Enciclopedia del Abismo

El **Códice del Abismo** está implementado en primera versión (10A). Registra descubrimientos derivados del estado del juego sin coste de guardado extra.

### Categorías implementadas

- Estratos — desbloqueados al visitar un sector del estrato
- Sectores — desbloqueados al descubrir la zona
- Recursos — desbloqueados al tener qty > 0 en inventario o aparecer en el diario
- Amenazas — desbloqueadas al encontrar al enemigo en combate o como evento de amenaza
- Criaturas — la criatura del jugador siempre descubierta; el resto permanece oculto
- Lugares (POIs) — desbloqueados al descubrir el sector que los contiene

### Categorías futuras

- Contratables, reliquias, eventos especiales, lore del Abismo, zonas secretas visitadas

---

## Modos de Expedición

| Modo | Enfoque |
|---|---|
| Marcha Libre | Equilibrado (exploración + recursos + amenaza) |
| Caza | Más amenazas, combates, XP de combate |
| Recolección | Más nodos de recurso, menos combates |
| Exploración | Más rutas, niebla, estratos, secretos |
| Personalizada | Jugador ajusta porcentajes (**futuro**) |

---

## Arquetipos de Personaje

### 1. Guardián del Camino
- **Rol:** Defensa y resistencia
- **Fantasía:** Guardia de caminos endurecido. Cuero gastado, hierro viejo, farol, escudo abollado.
- **Pasiva:** Paso Firme (+5 HP o reducción leve de daño)
- **Visual:** Cuerpo ancho, capa pesada, hierro, cuero oscuro, farol cálido, postura firme

### 2. Runario Errante
- **Rol:** Magia antigua y secretos
- **Fantasía:** Estudioso de ruinas y símbolos. Capucha profunda, bastón, talismanes, pergaminos.
- **Pasiva:** Lectura de Sellos (mejora eventos de exploración/secreto)
- **Visual:** Capucha, bastón, runas tenues, violeta apagado

### 3. Rastreador de Bruma
- **Rol:** Exploración y rutas
- **Fantasía:** Explorador de caminos perdidos. Conoce huellas, barro, senderos ocultos.
- **Pasiva:** Senda Oculta (mejora rutas/exploración)
- **Visual:** Silueta ligera, capa larga, mapa enrollado, cuchillo, verde oscuro/cuero

---

## Criaturas Iniciales

### Velthar (Exploración)
- Ciervo/cabra rúnico de bosque y niebla
- Cuerpo elegante, cuernos bifurcados azul mágico, runas en lomo, niebla suave
- Personalidad: intuitivo, noble, silencioso
- Pasiva: **Instinto de Niebla** (mejora exploración, secretos, rutas ocultas)

### Brontik (Defensa)
- Bestia acorazada: jabalí + armadillo + draco terrestre
- Cuerpo bajo, placas grandes, brasa suave entre placas
- Personalidad: protector, testarudo, firme
- Pasiva: **Coraza de Ruta** (reduce daño recibido)

### Lúmora (Recolección)
- Familiar cristalino de luz antigua (no dron, no bola sci-fi)
- Cuerpo pequeño, cola en llama/cristal, azul apagado + violeta + dorado tenue
- Personalidad: curiosa, sensible, luminosa
- Pasiva: **Eco de Cristal** (mejora recursos/recolección)

---

## Biomas Iniciales

### Bosque Rúnico
Bosque nocturno antiguo. Camino estrecho, raíces, niebla baja, piedras rúnicas, árboles altos.
Fondo oscuro verdoso · troncos · raíces · niebla · piedra rúnica.

### Costa Arcana
Costa nocturna fría. Rocas, agua oscura, bruma marina, cristales naturales apagados.
No playa alegre, no sci-fi.

### Forja Arcanista
Ruinas de forja medieval. Piedra, hierro viejo, brasas, humo, columnas rotas.
No fábrica futurista.

---

## Recursos

### Bosque Rúnico / Raíces del Abismo
| Recurso | Visual | Utilidad futura |
|---|---|---|
| Madera Rúnica | Rama curva con runa dorada | Mejoras de refugios, bastones, estructuras |
| Raíz de Aethel | Raíz en S con brillo mágico apagado | Curación, vínculo de criatura, tónicos |
| Hoja Luminaria | Hoja lanceolada, borde dorado apagado | Recetas, rastreo, consumibles |

### Costa Arcana
| Recurso | Visual | Utilidad futura |
|---|---|---|
| Sal Arcana | Cristales bajos, marfil/pergamino | Conservación, rituales, posadas costeras |
| Cristal de Marea | Triangular, azul grisáceo, base de roca | Mejoras mágicas, reliquias, rutas costeras |
| Escama Nácar | Gota curva, marfil/azul/dorado | Armaduras ligeras, reliquias |

### Forja Arcanista / Estratos de Forja
| Recurso | Visual | Utilidad futura |
|---|---|---|
| Mineral de Forja | Roca angular, veta metálica, grieta naranja | Armas, armaduras, forjas |
| Placa Antigua | Placa oxidada, remaches, arañazo | Armaduras, reparación de estructuras |
| Carbón Resonante | Roca negra, grieta naranja, humo | Forja, calor, producción |

---

## Eventos de Marcha

Todos los eventos deben verse en la escena, no ser solo texto.

| Tipo | Visual |
|---|---|
| Recurso | Nodo visual con animación de aparición |
| Exploración | Niebla abriéndose, senda marcada, runa en piedra, grieta nueva |
| Criatura | Reacción visible de la mascota (olfatea, pisa firme, señala) |
| Amenaza | Huella grande, ojos en niebla, sombra, rastro hostil |
| Microevento | Viento, brasas, niebla, farol, ramas (atmósfera) |

---

## Combate

No es modal encima de la ruta. Es una escena propia.

**Flujo:**
1. Amenaza aparece durante marcha
2. Marcha se pausa
3. CombatScene se activa
4. Enemigo prepara ataque
5. Jugador elige postura (Prudente / Equilibrada / Audaz)
6. Si no elige en 5 segundos → Equilibrada automática
7. Se resuelve daño
8. Se registra combate
9. Marcha continúa

### Posturas
- **Prudente:** Cubrirse y leer el ataque
- **Equilibrada:** Mantener posición
- **Audaz:** Romper el ritmo enemigo

### Enemigos Iniciales

| Enemigo | Concepto | Ataques |
|---|---|---|
| Saqueador Rúnico | Bandido de caminos | Estocada rápida (6 dmg, mejor: Prudente), Trampa rúnica (8 dmg, mejor: Equilibrada) |
| Bestia de Fractura | Criatura salvaje deformada | Zarpazo (8 dmg, mejor: Equilibrada), Embestida salvaje (10 dmg, mejor: Prudente) |
| Gólem Dormido | Constructo de forja que despierta | Golpe pesado (12 dmg, mejor: Prudente), Pisotón sísmico (13 dmg, mejor: Audaz) |
| Guardián de Fractura | Reliquia cristalina rota | Rayo de fractura (14 dmg, mejor: Equilibrada), Pulso cristalino (15 dmg, mejor: Prudente) |

---

## Mapa — Hacia el Abismo en Espiral

### Estado actual
Mapa visual del Abismo implementado en versión inicial (9A): tablero vertical con bandas de estrato, nodos en espiral, panel de detalle, niebla para zonas no descubiertas. Los 6 sectores actuales están distribuidos en 3 estratos.

### Dirección futura
El mapa evolucionará conforme se añadan estratos y sectores:

- **Eje vertical** — profundidad como eje principal
- **Estratos** — capas horizontales dentro del eje vertical
- **Sectores** — zonas dentro de cada estrato
- **Rutas descendentes** — conexiones entre estratos
- **Zonas secretas** — visibles solo si se han descubierto
- **Nodos de descanso** — campamentos, posadas subterráneas
- **Rutas bloqueadas** — requieren condiciones especiales
- **Rutas peligrosas** — accesibles pero con penalización
- **Rutas automáticas** — disponibles para enviar contratables

### Transición
El atlas actual (6 sectores, conexiones planas) se mantendrá funcional hasta que se implemente el nuevo sistema de estratos. No romper el prototipo.

---

## POIs (Puntos de Interés) — Futuro

| POI | Uso |
|---|---|
| Posada | Descanso, recuperación, buffs |
| Forja | Mejorar equipo, armas, armaduras |
| Refugio | Seguridad, descanso básico |
| Mercader | Compra/venta |
| Taberna | Rumores, encargos, encuentro de contratables |
| Puesto de suministros | Consumibles, preparación |
| Campamento subterráneo | Nodo de descanso en el Abismo |
| Puerta de estrato | Acceso al siguiente nivel |

Los recursos se usarán para mejorar POIs (Madera Rúnica → mejoras de posada; Mineral → mejoras de forja).

---

## La Torre (Postgame)

La Torre deja de ser el objetivo central inicial.

Será contenido desbloqueado cuando el jugador haya llegado al fondo del Abismo al menos una vez.

### Características

- Mundo separado, con sus propias reglas
- Contenido avanzado de largo plazo
- Nuevos enemigos específicos de la Torre
- Estratos verticales ascendentes (inverso al Abismo)
- Desafíos de alto rango
- Contratos especiales exclusivos
- Loot exclusivo y reliquias únicas
- Historia y lore extendido

### Lógica inversa

El Abismo baja. La Torre sube. Ambos comparten la estructura de estratos, pero la Torre es más exigente y requiere haber completado el Abismo al menos una vez como desbloqueador.

**No implementar todavía.**

---

## Sistemas Futuros (NO implementar todavía)

- **Estratos del Abismo:** sistema de profundidad con loot tier, peligro, bioma, secretos
- **Zonas secretas:** acceso por condición (equipo, mascota, rango, probabilidad)
- **Subordinados y contratos:** expediciones automáticas con personajes contratados
- **Rangos:** progresión del explorador con acceso a contenido y contratos
- **Encuentros con contratables:** aparición durante marcha
- **Enciclopedia del Abismo:** registro de descubrimientos, enemigos, recursos, zonas
- **La Torre (postgame):** contenido post-Abismo
- **Marcha Viva:** loop activo en tiempo real
- **Eco de Marcha:** pasos retroactivos (implementado en 8A)
- **Marcha Interior:** pasos en casa/cinta, sin descubrir sectores
- **Modo Personalizado:** sliders de caza/recolección/exploración
- **Cooperativo:** mundo base común, rutas compartidas
- **Equipo visible:** slots de arma/armadura/casco/capa/escudo/reliquia
- **Desbloqueo de mascotas:** piezas, rastros, fragmentos, huevos, núcleos
- **Mejoras profundas de POIs**

---

## Estructura de Carpetas Objetivo

```
src/
  main.jsx
  App.jsx
  styles.css
  data/
    gameData.js
  components/
    AppShell.jsx
    BottomNav.jsx
    StatBar.jsx
    tokens/
      ArchetypeToken.jsx
      CreatureToken.jsx
      EnemyToken.jsx
      ResourceNode.jsx
  screens/
    StartScreen.jsx
    CaravanScreen.jsx
    MapScreen.jsx
    DiaryScreen.jsx
    InventoryScreen.jsx
    CreatureScreen.jsx
  systems/
    expeditionSystem.js
    combatSystem.js
    inventorySystem.js
    mapSystem.js
    stepSourceSystem.js
    pedometerSystem.js
    echoSystem.js
    saveSystem.js
  utils/
    helpers.js
```

---

## Regla de Trabajo

> No implementar todo de golpe. Cada bloque debe ser estable antes de avanzar.

**Prioridad siempre:**
1. Compilar
2. Poder jugar
3. Loop estable
4. Claridad visual
5. Cambios visibles
6. No romper sistemas existentes

Si algo se rompe → primero corregir la compilación. No acumular features encima de pantalla blanca.

---

## Roadmap

### Completado
- ✅ 1A — Scaffold Vite + React
- ✅ 2A — Datos de juego (arquetipos, criaturas, enemigos, sectores)
- ✅ 3A — Loop de marcha simulada + estados
- ✅ 4A — Combate con posturas y timer
- ✅ 5A — Guardado local + pantalla de inicio
- ✅ 6A — Sistema de descubrimiento de sectores
- ✅ 7A — Pulido visual (escena de campamento, atlas, crónica)
- ✅ 8A — Podómetro web experimental (DeviceMotionEvent)
- ✅ 9A — Mapa visual del Abismo en espiral con bandas de estrato
- ✅ 9B — Datos de estratos (ABYSS_STRATA), enemyPool, lootTier, abyssSystem.js
- ✅ 10A — Códice del Abismo: enciclopedia derivada de estado, 6 categorías
- ✅ 10B — Saneo y coherencia: inventario plano, entradas ocultas corregidas, docs actualizados

### Inmediato
- 🔲 11A — Primer nivel de progresión del jugador (XP, nivel, HP visible)
- 🔲 11B — Primer estrato completo con contenido funcional diferenciado

### Próximo
- 🔲 11A — Enciclopedia básica (registro de recursos y enemigos)
- 🔲 11B — Primer contratable encuentro simple
- 🔲 12A — Zonas secretas simples (acceso por mascota o equipo)
- 🔲 12B — Sistema de rangos básico

### Largo Plazo
- 🔲 Múltiples estratos con biomas propios
- 🔲 Sistema completo de subordinados y contratos
- 🔲 Enciclopedia completa
- 🔲 La Torre (postgame)
- 🔲 Marcha Viva en tiempo real
- 🔲 Modo cooperativo

---

## Modos de conteo de pasos

### Estado actual

| Modo | Estado |
|---|---|
| Modo prototipo (botones +500 / +1000 pasos) | Implementado — predeterminado durante desarrollo |
| stepSource (base técnica unificada) | Implementado — abstrae origen de los pasos |
| Podómetro web (DeviceMotionEvent) | Experimental — aparcado temporalmente por fiabilidad variable en dispositivos |

### Planificación futura

**Modo pasos reales (mercado final)**
Lectura del sensor del teléfono mediante `DeviceMotionEvent`. El jugador avanza en la marcha caminando físicamente. La infraestructura está en `pedometerSystem.js` y `stepSourceSystem.js`, pero la fiabilidad entre dispositivos móviles es variable. Se retomará cuando el loop de contenido esté estable.

**Modo prototipo / desarrollo**
Simulación de pasos mediante botón en pantalla. Permite probar el loop completo en PC sin caminar. Debe seguir existiendo durante todo el desarrollo; no se elimina cuando se reactive el podómetro.

Regla: **ambos modos coexisten siempre**. El selector de modo de pasos se implementará más adelante, cuando el loop de contenido sea estable.

---

## Equipo mecánico vs skins visuales

### Regla de separación

El equipo no define la apariencia del personaje. Las skins sí.

| Sistema | Función |
|---|---|
| **Equipo** (armas, armaduras, reliquias, herramientas) | Stats, resistencias, acceso a zonas, bonus de combate y exploración, requisitos de ruta |
| **Skins** (trajes, variantes visuales, cosméticos) | Apariencia visual del personaje en escena |

### Por qué esta separación

- El equipo puede cambiar con frecuencia. Redibujarlo cada vez sería un coste de producción inasumible en prototipo.
- Las skins son un sistema cosmético independiente que se puede implementar más adelante sin afectar la mecánica.
- Un jugador puede llevar la mejor armadura del juego y seguir viendo la silueta base del personaje.

### Estado

Ni equipo mecánico completo ni skins están implementados todavía. Esta sección documenta la decisión de diseño para que no se mezclen los dos sistemas en el futuro.
