# Aethermarch — Project Brief

> Documento de referencia maestro. No es una lista de tareas. Es la memoria del proyecto.

---

## Concepto Central

**Aethermarch** es un RPG móvil de exploración basado en pasos reales.

La fantasía principal no es "contar pasos". Es:

> "Cada paseo real hace avanzar mi caravana por un mundo medieval misterioso."

El jugador camina en la vida real → su caravana avanza por un mundo fantástico medieval → descubre, lucha, recolecta, progresa.

---

## Identidad Visual

**Tono:** fantasía medieval oscura, magia antigua, viaje de caravana.

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
Madera oscura · cuero envejecido · hierro viejo · piedra fría · pergamino · brasas · fuego · runas · faroles · caminos de tierra · raíces · niebla · bosques · ruinas · forjas · cristales naturales · sombras.

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
Mira el móvil mientras camina → ve la caravana avanzar, eventos, combates, recolección.
Recibe más espectáculo y decisiones ligeras, pero no es obligatorio.

**Regla central:** Mirar el móvil debe ser entretenido, pero no obligatorio. Sin reflejos rápidos. Sin eventos perdibles críticos.

---

## Loop Principal (Futuro Completo)

1. Elegir arquetipo
2. Elegir criatura inicial
3. Preparar caravana
4. Alzar la caravana ← primer botón narrativo (no "Iniciar Tramo 1")
5. Avanzar por tramos
6. Ver eventos de marcha (recursos, exploración, criatura, amenaza, microevento)
7. Recolectar recursos
8. Entrar en combates
9. Completar tramo → resumen
10. Actualizar diario e inventario
11. Subir dominio del sector
12. Mejorar POIs / preparar siguiente ruta
13. Continuar al siguiente tramo

Los tramos son consecutivos (Tramo 1 → Tramo 2 → Tramo 3), no sueltos.

---

## Modos de Expedición

| Modo | Enfoque |
|---|---|
| Marcha Libre | Equilibrado (exploración + recursos + amenaza) |
| Caza | Más amenazas, combates, XP de combate |
| Recolección | Más nodos de recurso, menos combates |
| Exploración | Más rutas, niebla, sectores, secretos |
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

### Bosque Rúnico
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

### Forja Arcanista
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
| Exploración | Niebla abriéndose, senda marcada, runa en piedra |
| Criatura | Reacción visible de la criatura (olfatea, pisa firme, señala) |
| Amenaza | Huella grande, ojos en niebla, sombra, rastro hostil |
| Microevento | Viento, brasas, niebla, farol, ramas (atmósfera) |

---

## Combate

No es modal encima de la ruta. Es una escena propia.

**Flujo:**
1. Amenaza aparece durante marcha
2. Marcha se pausa (pasos dejan de subir)
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

## Mapa

Atlas estratégico. No mapa profundo en fase 1.

Cada sector tiene: id · nombre · bioma · descubierto · visitas · dominio · nivel de dominio · recursos · amenaza · POI.

Durante combate el mapa muestra: caravana detenida · "Combate en curso" · enemigo · botón "Ver combate".

**Subir dominio** (repetir rutas) desbloquea en el futuro: mejores recursos, secretos, seguridad, eventos, beneficios.

---

## POIs (Puntos de Interés) — Futuro

| POI | Uso |
|---|---|
| Posada | Descanso, recuperación, buffs |
| Forja | Mejorar equipo, armas, armaduras |
| Refugio | Seguridad, descanso básico |
| Mercader | Compra/venta |
| Taberna | Rumores, encargos |
| Puesto de suministros | Consumibles, preparación |

Los recursos se usarán para mejorar POIs (Madera Rúnica → mejoras de posada; Mineral → mejoras de forja).

---

## Sistemas Futuros (NO implementar todavía)

- **Marcha Viva:** Loop activo de marcha en tiempo real con animaciones
- **Eco de Marcha:** Recuperar hasta 2000 pasos caminados sin iniciar marcha
- **Marcha Interior:** Pasos en casa/cinta, sin descubrir sectores nuevos
- **Rutas:** Destinos elegibles (ciudad, posada, refugio, torre)
- **Modo Personalizado:** Sliders de caza/recolección/exploración
- **Objetivo largo:** Gran torre/estructura central a semanas/meses de distancia
- **Cooperativo:** Mundo base común, rutas compartidas
- **Equipo visible:** Slots de arma/armadura/casco/capa/escudo/reliquia
- **Desbloqueo de criaturas:** Via piezas, rastros, fragmentos, huevos, núcleos
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
