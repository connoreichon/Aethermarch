# Aethermarch — Color Bible

> Versión 17A. Paleta funcional oficial del juego.
> No usar estilos neón, sci-fi ni dashboard moderno.
> La estética es medieval oscura: profunda, legible, diferenciada.

---

## 1. Principios visuales

- **Oscuro como base.** El fondo es casi negro con tonos cálidos (madera quemada, cuero envejecido). No marrón plano.
- **Contraste funcional.** Cada sistema tiene un color propio. El jugador aprende el código visualmente.
- **Escasez de color.** El color destaca cuando importa. Los fondos son neutros; los datos, vivos.
- **Medieval, no moderno.** Rojo óxido, verde liquen, azul niebla, violeta rúnico, dorado polvoriento.
- **Sin neón.** Sin brillo eléctrico, sin fondo negro puro (#000000), sin saturación excesiva.

---

## 2. Paleta base

| Token                      | Valor     | Uso                              |
|---------------------------|-----------|----------------------------------|
| `--color-abyss-black`     | `#070807` | Fondo absoluto de la app         |
| `--color-obsidian`        | `#0E0B08` | Fondo cálido secundario          |
| `--color-panel`           | `#14100C` | Fondo de paneles principales     |
| `--color-panel-soft`      | `#1B1510` | Fondo de paneles secundarios     |
| `--color-leather-dark`    | `#21160F` | Superficies de cuero oscuro      |
| `--color-leather`         | `#3A2618` | Cuero estándar                   |
| `--color-wood`            | `#4B321F` | Madera                           |
| `--color-iron`            | `#343A3D` | Hierro oscuro — fondos bloqueados|
| `--color-iron-light`      | `#5A5F61` | Hierro claro — texto bloqueado   |
| `--color-stone`           | `#252B2E` | Piedra fría                      |
| `--color-stone-light`     | `#8E9692` | Texto secundario, metadatos      |
| `--color-parchment`       | `#C8B88A` | Texto principal, pergamino       |
| `--color-parchment-bright`| `#F3E6C8` | Texto en botones oscuros, énfasis|

---

## 3. Colores funcionales

| Token                  | Valor     | Sistema                          |
|-----------------------|-----------|----------------------------------|
| `--color-hp`          | `#D62828` | Vida / daño recibido             |
| `--color-hp-dark`     | `#321010` | Fondo de barra de HP             |
| `--color-xp`          | `#3FA34D` | XP / éxito / progreso            |
| `--color-xp-dark`     | `#102A18` | Fondo de barra de XP             |
| `--color-rank`        | `#B8944A` | Rango / recompensa / dorado      |
| `--color-rank-bright` | `#D6B35F` | Rango destacado / brillo         |
| `--color-mist`        | `#4F8F95` | Abismo / mapa / profundidad      |
| `--color-mist-dark`   | `#193238` | Fondo de info de profundidad     |
| `--color-rune`        | `#6D5A9C` | Secretos / lore / rúnico         |
| `--color-rune-bright` | `#9A7BD1` | Secreto descubierto / brillo     |
| `--color-ember`       | `#D46A2D` | Acción principal / brasa / forja |
| `--color-ember-dark`  | `#8A3F1D` | Brasa oscura                     |
| `--color-danger`      | `#B63A2E` | Peligro / botón principal rojo   |
| `--color-success`     | `#3FA34D` | Éxito (alias de `--color-xp`)    |
| `--color-warning`     | `#B8944A` | Advertencia (alias de `--color-rank`) |
| `--color-locked`      | `#5A5F61` | Elementos bloqueados             |

---

## 4. Colores por sistema

### HP / Vida
- Principal: `--color-hp` (`#D62828`)
- Fondo: `--color-hp-dark` (`#321010`)
- Texto de daño en combate: `--color-hp`

### XP / Progreso
- Principal: `--color-xp` (`#3FA34D`)
- Fondo: `--color-xp-dark` (`#102A18`)
- Postura correcta en combate: `--color-xp`

### Rango
- Principal: `--color-rank` (`#B8944A`)
- Brillo: `--color-rank-bright` (`#D6B35F`)
- Chips de rango, etiquetas doradas: `--color-rank`

### Secretos / Lore
- Principal: `--color-rune` (`#6D5A9C`)
- Brillo: `--color-rune-bright` (`#9A7BD1`)
- Borde nodo secreto, badge "Secreto": `--color-rune-bright`
- Entradas de lore en Códice: `--color-rune`

### Abismo / Mapa / Profundidad
- Principal: `--color-mist` (`#4F8F95`)
- Fondo: `--color-mist-dark` (`#193238`)
- Conexiones entre nodos descubiertos: `rgba(79,143,149,0.42)`
- Icono de bioma costero: `--color-mist`

### Contratos
- Base / contrato activo: `--color-parchment`
- Recompensa: `--color-rank`
- Probabilidad estimada: `--color-mist`
- Éxito: `--color-success`
- Parcial: `--color-warning`
- Fracaso: `--color-hp` / `--color-ember-dark`

### Exploradores / Mercenarios
- Bloqueados: `--color-locked` (`#5A5F61`)
- Disponibles (futuro): `--color-mist`
- Especial / elite (futuro): `--color-rank`

### POIs (Lugares seguros)
| Tipo               | Color                         |
|--------------------|-------------------------------|
| Refugio            | `--color-xp` (verde)          |
| Posada             | `--color-rank` (dorado)       |
| Mercader           | `--color-parchment`           |
| Forja              | `--color-ember`               |
| Taberna            | `#8A5A3C` (madera oscura)     |
| Puesto suministros | `--color-mist`                |

---

## 5. Colores por modo de marcha

| Modo          | Token             | Valor     | Acento visual             |
|--------------|-------------------|-----------|---------------------------|
| Marcha Libre  | `--mode-free`     | `#B8944A` | Dorado / equilibrio       |
| Exploración   | `--mode-explore`  | `#6D5A9C` | Violeta / descubrimiento  |
| Recolección   | `--mode-gather`   | `#3FA34D` | Verde / recursos          |
| Caza          | `--mode-hunt`     | `#B63A2E` | Rojo / combate            |
| Personalizada | `--mode-custom`   | `#5A5F61` | Hierro / neutro           |

Aplicación:
- Píldora seleccionada en el strip de modos: color del modo
- Chips de preparación: color del modo activo
- Resumen de ruta: color secundario del modo

---

## 6. Colores por bioma y capa del Abismo

| Bioma    | Color icono          | Banda de estrato               |
|----------|----------------------|-------------------------------|
| Bosque   | `--color-xp`         | Verde oscuro tenue             |
| Costa    | `--color-mist`       | Azul niebla oscuro             |
| Forja    | `--color-ember`      | Rojo óxido oscuro              |

| Estrato  | Profundidad | Identidad            |
|----------|-------------|----------------------|
| I        | 0–300 m     | Verde bosque         |
| II       | 300–600 m   | Azul niebla          |
| III      | 600–900 m   | Brasa / forja        |

---

## 7. Botones y CTAs

### Botón principal — "Iniciar la marcha"
```css
background: linear-gradient(135deg, #B63A2E, #D46A2D);
color: var(--color-parchment-bright);
border: 1px solid rgba(214,106,45,0.65);
box-shadow: 0 0 22px rgba(182,58,46,0.28);
```
Hover: `filter: brightness(1.06)`
Disabled: `background: var(--color-iron)`, `color: var(--color-stone-light)`

### Botón secundario
```css
background: rgba(42,26,16,0.5);
border: 1px solid rgba(98,107,111,0.32);
color: var(--color-parchment);
```

### Botón de peligro / borrar
Color de texto: `--color-hp`, sin fondo, solo texto.

---

## 8. Estados de UI

| Estado    | Color principal    | Fondo sugerido         |
|-----------|--------------------|------------------------|
| Éxito     | `--color-success`  | `--color-xp-dark`      |
| Parcial   | `--color-warning`  | `rgba(184,148,74,0.08)`|
| Fracaso   | `--color-hp`       | `--color-hp-dark`      |
| Bloqueado | `--color-locked`   | `--color-iron`         |
| Info      | `--color-mist`     | `--color-mist-dark`    |
| Secreto   | `--color-rune`     | `rgba(109,90,156,0.08)`|
| Activo    | `--color-rank`     | `rgba(184,148,74,0.06)`|

---

## 9. Reglas de uso

1. **No usar color sin significado.** Si añades un color nuevo, documéntalo aquí.
2. **Fondos primero.** Los fondos son oscuros neutros. El color vive en texto, bordes e iconos.
3. **Un color dominante por pantalla.** El mapa es azul niebla. La caravana es brasa/dorado. El combate es rojo.
4. **Jerarquía por saturación.** Más saturado = más urgente. Texto secundario siempre en `--color-stone-light`.
5. **No mezclar violeta con dorado** en el mismo elemento (conviven en pantalla, pero no en la misma pieza).
6. **El verde es éxito, el rojo es peligro.** No invertir en ningún caso.
7. **Los aliases de compatibilidad** (`--color-gold`, `--color-magic`, `--color-bg`) están para no romper código existente. No usarlos en código nuevo: usar el token semántico.

---

## 10. No usar

- ❌ Neón puro (#00FF00, #00FFFF, #FF00FF)
- ❌ Blanco puro (#FFFFFF) como color de texto principal
- ❌ Negro puro (#000000) como fondo
- ❌ Azul eléctrico (#0088FF) o similar
- ❌ Cualquier color que recuerde a dashboards modernos o apps de fitness
- ❌ Degradados multicolor en un mismo elemento
- ❌ Sombras de colores muy saturados salvo en botones CTA
- ❌ Más de 3 colores distintos en un mismo panel/card
