# El Abismo — Diseño Expandido

> Documento complementario al PROJECT_BRIEF. Profundiza en el diseño del mundo, los estratos y los sistemas de exploración.

---

## Concepto del Mundo

El Abismo es una grieta profunda que lleva siglos existiendo bajo el mundo conocido. Nadie sabe dónde termina. Los mapas del Abismo son fragmentarios, contradictorios y siempre incompletos. Cada expedición que regresa trae versiones diferentes del mismo tramo.

Lo que sí saben los expedicionarios:

- Cada capa se vuelve más oscura, más antigua, más peligrosa.
- Los recursos se vuelven más raros y más valiosos cuanto más abajo.
- Algunas zonas solo existen para quienes saben mirar.
- La criatura que llevas contigo cambia la forma en que percibes el Abismo.
- No todos los que bajan pretenden subir.

---

## Geometría del Abismo

El Abismo no es un pozo. Es una estructura en espiral, con niveles que se van abriendo hacia los lados conforme se baja.

Cada estrato es un anillo de zonas interconectadas. El jugador puede moverse lateralmente dentro del estrato (de zona en zona) o descender al siguiente estrato usando una ruta de bajada.

```
          [Linde de Raíz]
        /    |    \     |
 [Zona A] [Zona B] [Zona C] [Zona Secreta]
          |         |
      [Corredor de Esporas]
        /    |    \
  [Zona D] [Zona E] ...
          |
      [Cuenca de Resina]
          ...
```

Las rutas entre estratos no son simples escaleras. Pueden ser:

- cornisas de roca
- grietas verticales
- escaleras excavadas por colonias
- agujeros caídos
- túneles de agua seca
- corrientes de lava solidificada

Cada tipo de ruta puede requerir condiciones especiales para cruzarse.

---

## Los Estratos

### Principios de diseño por estrato

Cada estrato debe tener:

1. **Identidad visual clara** — se ve diferente desde el primer momento
2. **Fauna específica** — al menos dos criaturas propias
3. **Recurso propio** — al menos un material único
4. **Zona secreta** — al menos una con condición de acceso no trivial
5. **Peligro escalado** — coherente con la profundidad
6. **Evento de primer descubrimiento** — primera vez que bajas aquí, ocurre algo especial

### Catálogo provisional de estratos

#### Estrato 1 — Linde de Raíz
- **Profundidad:** 1
- **Bioma:** raíces antiguas, tierra húmeda, hongos pequeños
- **Color dominante:** verde oscuro, marrón tierra, negro cálido
- **Luz:** tenues brillos de esporas pequeñas, faroles de exploradores anteriores
- **Enemigos:** Saqueador Rúnico, Araña de Raíz
- **Recursos:** Madera Rúnica, Raíz de Aethel
- **Secreto:** Cueva de setas detrás de muro de raíces — requiere golpe contundente o mascota pesada
- **Peligro:** bajo
- **Loot tier:** 1
- **Contratables encontrables:** Ivar, rastreador de esporas; Errante de Caminos

---

#### Estrato 2 — Corredor de Esporas
- **Profundidad:** 2
- **Bioma:** hongos luminosos, niebla de esporas, túneles estrechos
- **Color dominante:** azul-violeta apagado, marrón húmedo, blanco sucio
- **Luz:** hongos bioluminiscentes, nula luz exterior
- **Enemigos:** Hongo Marchante, Araña de Esporas
- **Recursos:** Quitina Blanda, Espora Luminosa
- **Secreto:** Galería de hongos dorados — requiere máscara filtrante o criatura con resistencia a esporas
- **Peligro:** bajo-medio
- **Loot tier:** 2
- **Riesgo especial:** exposición prolongada a esporas sin protección → penalización de marcha

---

#### Estrato 3 — Cuenca de Resina
- **Profundidad:** 3
- **Bioma:** resina endurecida, brasas enterradas, colonias primitivas
- **Color dominante:** ámbar oscuro, negro, naranja profundo
- **Luz:** brasas bajo la resina, grietas naranjas en la roca
- **Enemigos:** Colono de Resina, Guardia Larvario
- **Recursos:** Núcleo de Resina, Brasa Enterrada, Quitina Dura
- **Secreto:** Galería sellada por resina antigua — requiere herramienta disolvente
- **Peligro:** medio
- **Loot tier:** 2–3

---

#### Estrato 4 — Cámara de las Hormigas de Fuego
- **Profundidad:** 4
- **Bioma:** túneles rojizos, resina ardiente, colonias subterráneas masivas
- **Color dominante:** rojo ladrillo, negro quemado, ámbar intenso
- **Luz:** galerías bioluminiscentes de la colonia, resina ardiente
- **Enemigos:**
  - Hormiga Obrera (daño bajo, en grupo, sin foco en jugador solo)
  - Hormiga Soldado (daño medio, persigue)
  - Reina Larvaria (jefe de estrato, acceso por zona secreta)
- **Recursos:** Quitina Ardiente, Mandíbula Ígnea, Resina Viva
- **Secreto:** Cámara de la Reina — requiere armadura resistente al fuego
- **Peligro:** medio-alto
- **Loot tier:** 3
- **Restricción de acceso al estrato:** armadura con resistencia mínima al calor o mascota ígnea

---

#### Estrato 5 — Ruinas Sumergidas
- **Profundidad:** 5
- **Bioma:** piedra antigua bajo agua oscura, runas casi borradas, silencio
- **Color dominante:** gris piedra, azul oscuro, verde musgo
- **Luz:** runas brillando bajo el agua, roca fosforescente
- **Enemigos:** Guardián de Piedra, Espectro de Agua
- **Recursos:** Piedra Arcana, Runa Sumergida, Alga de Sellos
- **Secreto:** Cámara de archivo subterráneo — requiere habilidad de lectura de runas (Runario Errante o contratable rúnico)
- **Peligro:** alto
- **Loot tier:** 4

---

#### Estrato 6 — Desierto de Hielo
- **Profundidad:** 6
- **Bioma:** viento helado, cristales de hielo, silencio absoluto
- **Color dominante:** azul pálido, blanco frío, gris plateado
- **Luz:** reflejo de cristales, sin luz propia
- **Enemigos:** Gólem de Hielo, Cazador de Niebla Fría
- **Recursos:** Cristal de Hielo, Escarcha Arcana, Viento Solidificado (metáfora de recurso)
- **Secreto:** Cueva de Eco — requiere crear silencio absoluto durante la marcha (sin acciones activas)
- **Peligro:** alto
- **Loot tier:** 4–5
- **Restricción:** equipo con protección de frío o criatura adaptada al frío

---

#### Estrato 7 — Forjas Enterradas
- **Profundidad:** 7
- **Bioma:** hierro vivo, magma contenido, constructos durmientes, ruido metálico constante
- **Color dominante:** negro hierro, naranja magma, rojo brasa
- **Luz:** magma, brasas, forjas antiguas que aún arden
- **Enemigos:** Constructo Dormido (despertado por vibración), Guardia de Forja
- **Recursos:** Hierro Vivo, Polvo de Magma, Núcleo Constructo
- **Secreto:** Cámara de planos de forja — requiere contratable con especialidad en constructos
- **Peligro:** muy alto
- **Loot tier:** 5

---

#### Estrato 8 — Huesos Colosales
- **Profundidad:** 8
- **Bioma:** esqueletos de criaturas antiguas, cavernas enormes, polvo de eras extintas
- **Color dominante:** blanco hueso, ocre, gris ceniza
- **Luz:** hongos necrófagos, bio-luz de microorganismos en los huesos
- **Enemigos:** Necrófago de Polvo, Eco de la Criatura (sombra fantasmal del animal del que son los huesos)
- **Recursos:** Hueso Antiguo, Polvo de Era, Escama Fósil
- **Secreto:** Cámara craneal — dentro del cráneo de una criatura colosal. Requiere explorador o criatura pequeña que quepa.
- **Peligro:** extremo
- **Loot tier:** 6

---

#### Estrato 9 — Campo de Cristal Vivo
- **Profundidad:** 9
- **Bioma:** cristales que crecen, resuenan, cortan
- **Color dominante:** violeta, azul frío, blanco diamante
- **Luz:** los cristales emiten luz propia, pero cambia con el movimiento
- **Enemigos:** Fragmento Animado, Resonador
- **Recursos:** Cristal Vivo, Eco de Luz, Fragmento de Resonancia
- **Secreto:** Cámara de resonancia perfecta — requiere mascota o criatura con habilidad de sintonía
- **Peligro:** extremo
- **Loot tier:** 7

---

#### Fondo del Abismo — Sin nombre confirmado
- **Profundidad:** máxima
- **Estado:** desconocido
- **Lore:** nadie ha llegado y vuelto igual. Los relatos son contradictorios.
- **Nota de diseño:** se diseñará en profundidad cuando el resto del Abismo esté estable.

---

## Zonas Secretas — Diseño Detallado

### Por qué existen

Las zonas secretas hacen que la misma ruta pueda sentirse diferente para dos jugadores. Son una recompensa por la preparación, la exploración activa y el conocimiento acumulado del mundo.

No deben ser aleatorias puras. El jugador debe sentir que tiene agencia: si consigue la armadura adecuada, si lleva la mascota adecuada, si ha llegado al rango adecuado, podrá acceder a cosas que otros no ven.

### Condiciones de acceso

| Tipo de condición | Ejemplo |
|---|---|
| Equipo | Armadura resistente al fuego para Cámara de la Reina |
| Mascota | Rastreador para detectar setas ocultas |
| Herramienta | Disolvente para resina sellada |
| Contratable | Especialista rúnico para archivos subterráneos |
| Rango | Rango IV para acceder a Cámara Sellada Antigua |
| Recurso | Quitina Dura como "llave" para puerta de colonia |
| Arcano | Arquetipo Runario para leer sellos de acceso |
| Probabilidad | Modificada por dominio del estrato + mascota de detección |
| Silencio / inacción | Cueva de Eco (no hacer acciones durante X pasos) |
| Combinación | Mascota + equipo + rango mínimo |

### Visibilidad

- Zona completamente oculta: ni la entrada existe en el mapa hasta que se descubre.
- Zona bloqueada visible: la entrada existe, hay indicación de que hay algo, pero está sellada.
- Zona revelada sin acceso: el jugador ve la entrada pero no puede entrar todavía.

Cada opción genera una tensión diferente. La completamente oculta premia la exploración. La bloqueada visible genera objetivos a largo plazo.

---

## Mascotas — Diseño de Exploración

### Principio general

La mascota no es un seguidor pasivo. Es un sensor activo del Abismo. Su especialidad natural (agua, fuego, tierra, oscuridad, etc.) determina con qué biomas resuena y qué puede detectar.

### Sistema de habilidades de exploración (futuro)

Cada mascota tiene uno o más rasgos de exploración que se activan al entrar en estratos compatibles.

| Rasgo | Efecto |
|---|---|
| Olfato de esporas | Revela hongos ocultos, aumenta probabilidad de setas raras |
| Resistencia ígnea | Puede acceder a zonas de calor sin penalización |
| Instinto de niebla | Mejora detección de rutas ocultas y zonas de niebla |
| Sintonía cristalina | Detecta cristales y recursos brillantes en paredes |
| Aplastamiento | Puede abrir pasos derrumbados o sellados por peso |
| Paso silencioso | No activa constructos durmientes ni guardias de vibración |
| Lectura de aguas | Detecta ruinas bajo agua, mejora exploración en Ruinas Sumergidas |

### Diseño por criatura existente

**Velthar** (ciervo rúnico)
- Instinto de Niebla: descubre rutas en zonas de niebla
- Olfato arcano: puede detectar runas poco visibles
- Mejor en: Linde de Raíz, Corredor de Esporas, Ruinas Sumergidas

**Brontik** (bestia acorazada)
- Aplastamiento: abre pasos bloqueados por derrumbe
- Resistencia básica: tolera calor moderado sin penalización
- Mejor en: Cuenca de Resina, Forjas Enterradas

**Lúmora** (familiar cristalino)
- Sintonía cristalina: detecta recursos en paredes
- Emisión de luz: ilumina zonas de oscuridad total
- Mejor en: Campo de Cristal Vivo, Desierto de Hielo, Cámara de los Huesos

---

## Subordinados y Contratos — Diseño Detallado

### Por qué existen

El loop de marcha avanza cuando el jugador camina. Pero el jugador no puede estar siempre activo. Los contratos permiten que el juego avance en rutas ya conocidas mientras el jugador no está jugando activamente.

No reemplazan la marcha activa. La complementan. El jugador que camina más sigue avanzando más lejos. Pero el que contrata bien puede optimizar su progresión general.

### Tipos de contratables

| Clase | Función principal |
|---|---|
| Explorador | Busca rutas, descubre zonas, genera informe de hallazgos |
| Rastreador | Detecta zonas secretas, rastros de recursos raros |
| Recolector | Vuelve con recursos de estratos conocidos |
| Guerrero | Limpia amenazas en zonas de riesgo bajo o medio |
| Rúnico | Lee sellos, descifra accesos, facilita Ruinas Sumergidas |
| Guía de Abismo | Accede a estratos más profundos con menor riesgo |
| Especialista | Función única (p.ej. especialista en constructos, en hongos) |

### Ciclo de un contrato

1. Jugador encuentra al contratable durante la marcha
2. Jugador acepta o rechaza contratarlo
3. Si acepta: el contratable queda disponible en lista
4. Jugador asigna contrato: estrato objetivo, duración, modo
5. El contratable parte (tiempo real cuenta)
6. Al volver: informe narrativo breve + botín + posibles consecuencias
7. Contratable disponible para nuevo contrato (salvo que haya sufrido consecuencia)

### Sistema de consecuencias

Los contratos no son seguros garantizados. Dependiendo del riesgo del estrato y el rango del contratable:

- sin consecuencias (riesgo bajo + contratable adecuado)
- herida leve (necesita descanso antes del siguiente contrato)
- herida grave (tiempo de recuperación más largo)
- objeto perdido (requería equipamiento que no tenía)
- misión fallida (no trajo loot, solo el informe)
- desaparecido (extremo, alta rareza — requiere rescate o se pierde)

Los contratables de alto rango tienen menor probabilidad de consecuencias negativas.

### Ejemplo de contrato

```
Contratable: Ivar, rastreador de esporas (Rango II)
Especialidad: Hongos y túneles húmedos
Contrato: Buscar zona secreta en Corredor de Esporas
Duración: 3 horas tiempo real
Riesgo: bajo (especialidad compatible, rango adecuado)
Coste: 2x Espora Luminosa
Resultado esperado: informe de 1-2 zonas detectadas + posible Espora Rara
```

---

## Rangos — Estructura Provisional

### Por qué existen

El rango representa el historial del expedicionario. No es el nivel del personaje en el sentido de stats. Es su reputación en el Abismo y su acceso a recursos avanzados.

### Escala provisional

| Rango | Nombre | Requisitos de desbloqueo |
|---|---|---|
| I | Iniciado | Completar primer descenso |
| II | Caminante | Alcanzar estrato 3, completar 5 contratos |
| III | Explorador | Alcanzar estrato 5, descubrir 3 zonas secretas |
| IV | Expedicionario | Alcanzar estrato 7, tener contratable de Rango III |
| V | Capataz del Abismo | Alcanzar estrato 9 |
| VI | Señor de Profundidad | Llegar al fondo del Abismo |

Los rangos desbloquean: contratos más largos, estratos restringidos, equipo avanzado, reputación para encontrar mejores contratables.

### Relación con zonas secretas

Algunas zonas secretas tienen requisito de rango mínimo, no de equipo. El mundo reconoce a quienes han sobrevivido más tiempo.

---

## Encuentros con Contratables — Escenas

### Momentos de encuentro

Los encuentros deben sentirse narrativos, no como una pantalla de tienda.

Ejemplos de escenas de encuentro:

**Campamento en el Corredor de Esporas**
> "Un hombre con máscara de cuero está sentado al lado de las esporas. Tiene dos frascos sellados y un palo largo con gancho. Se llama Ivar. Dice que lleva tres semanas aquí abajo rastreando la ruta de los hongos. No pide mucho."

**Rescate tras combate**
> "Una figura atrapada bajo una roca. La liberás. Se llama Marra. Es arquera. No tiene adónde ir. Pregunta si lleváis destino."

**Posada subterránea**
> "Hay una posada excavada en la roca. Cuatro mesas. Un tabernero sin cara visible. En la esquina, un mercenario con los brazos quemados ofrece sus servicios para los estratos de fuego."

Cada encuentro tiene un nombre, una escena breve, y una propuesta de contrato o asociación.

---

## Enciclopedia del Abismo — Estructura

### Propósito

El jugador descubre el mundo lentamente. La enciclopedia registra ese conocimiento. No es obligatoria para avanzar, pero es recompensada.

### Categorías de entrada

**Fauna** — criaturas, jefes, comportamientos observados, debilidades, resistencias, relación con su bioma.

**Flora y Recursos** — materiales encontrados, usos, zonas de aparición, rareza, cómo conseguirlos.

**Biomas** — descripción del estrato, primeras impresiones, riesgos, curiosidades.

**Zonas Secretas** — registradas solo si se han visitado. Pueden quedar como "incompletas" si no se cumplió la condición de acceso pero se encontró la entrada.

**Contratables** — nombre, especialidad, historial de contratos, rasgo de carácter.

**Reliquias** — objetos únicos con historia en el mundo. Solo hay uno de cada uno.

**Eventos** — microeventos que solo ocurren una vez. Cuando ocurren, quedan registrados.

**Lore del Abismo** — fragmentos de historia encontrados en ruinas, sellos, archivos sumergidos.

### Mecánica de progresión

Completar una entrada de enciclopedia puede dar:
- XP
- Oro
- Recurso raro
- Información sobre un secreto del siguiente estrato
- Título o reconocimiento

---

## La Torre — Diseño Expandido

La Torre no es el destino original. Es lo que hay después del Abismo.

### Naturaleza

La Torre es la inversión del Abismo. Donde el Abismo baja, la Torre sube. Donde el Abismo es oscuro y húmedo, la Torre es fría y ventosa. Donde el Abismo guarda cosas antiguas, la Torre guarda cosas futuras.

No se sabe qué hay en la cima. Igual que nadie sabe qué hay en el fondo del Abismo.

### Relación con el Abismo

Ambos existen en el mismo mundo. La Torre está a la superficie, visible para quien no baja. El Abismo es invisible desde arriba. Los que han llegado al fondo del Abismo son los únicos que pueden ver la puerta de la Torre.

### Diferencias de diseño respecto al Abismo

| Aspecto | Abismo | Torre |
|---|---|---|
| Dirección | Descender | Ascender |
| Luz | Disminuye | Aumenta (y duele) |
| Enemigos | Criaturas subterráneas | Constructos, guardianes arcanos, eco de héroes caídos |
| Recursos | Materiales orgánicos y arcanos | Cristales superiores, aleaciones raras, runas de poder |
| Acceso | Desde inicio del juego | Solo tras completar el Abismo al menos una vez |
| Peligro | Escalado por profundidad | Constante y extremo desde el primer piso |
| Estética | Oscuridad, raíces, piedra húmeda | Viento, runas brillantes, piedra seca y fría, cielos imposibles |

### Motivo narrativo

El Abismo baja hacia lo que fue. La Torre sube hacia lo que podría ser. El jugador que ha bajado hasta el fondo y ha regresado lleva en sí algo que la Torre reconoce.

---

## Notas de Diseño — Reglas Generales

### Sobre la escala

No poner números inflados. Un estrato 4 no debe requerir 10,000 pasos para conquistarse. El diseño de escalado debe priorizar la sensación de progreso semanal real, no el número absurdo.

### Sobre la curva

El Abismo debe sentirse como exploración, no como grind. Cada estrato nuevo debe traer algo visualmente diferente y una pregunta nueva ("¿qué hay más abajo?"). La curiosidad es el motor.

### Sobre los secretos

Nunca deben ser aleatorios puros. Si la condición no está cumplida, la zona no aparece. Esto da al jugador control real. La satisfacción de cumplir la condición y desbloquear algo es más potente que la suerte.

### Sobre los contratos

Los contratables no deben ser "set and forget" sin sentido. Cada contrato debe tener un pequeño riesgo y devolver algo narrativo, aunque sea una sola frase de informe.

### Sobre la Torre

No implementar la Torre hasta que el Abismo tenga al menos 5 estratos jugables y estables. La Torre es postgame, no aspiración de roadmap cercano.

---

## Estado Actual de Implementación

| Sistema | Estado |
|---|---|
| Loop de marcha | Implementado (simulado con pasos manuales/podómetro) |
| Sistema de pasos (stepSource) | Implementado (8A) |
| Podómetro web | Implementado (8A) |
| Combate con posturas | Implementado |
| Guardado local | Implementado |
| Sistema de eco de marcha | Implementado |
| Atlas plano (mapa prototipo) | Implementado |
| Estratos del Abismo | No implementado |
| Zonas secretas | No implementado |
| Subordinados y contratos | No implementado |
| Rangos | No implementado |
| Enciclopedia | No implementado |
| Mascotas (habilidades activas) | No implementado |
| La Torre | No implementado |

---

*Este documento es una referencia de diseño viva. Se actualiza conforme el juego avanza.*
