# 🗺️ Roadmap: LLM Analytics Platform

## 📋 Resumen Ejecutivo

Este documento define las etapas de desarrollo priorizadas según complejidad y valor de negocio. El enfoque está en construir primero la "máquina de prompts" y el procesamiento de datos, dejando para después la infraestructura de autenticación y persistencia.

## 📊 Estado Actual del Proyecto

**Progreso General:** 2 de 7 etapas completadas (28.5%)

### ✅ Etapas Completadas

1. **Etapa 1: Estructura de Datos y Modelos** ✅
   - Tipos TypeScript completos (`types/index.ts`)
   - Schemas de validación Zod (`lib/schemas/index.ts`)
   - Constantes y configuraciones (`lib/constants.ts`)
   - Formularios actualizados con validación en tiempo real
   - Campos de sourceUrls y preferredCitations implementados

2. **Etapa 2: Sistema de Prompts Flexible** ✅
   - Motor de prompts completo (`lib/prompts/`)
   - PromptBuilder, TemplateEngine, SourceInjector implementados
   - Editor de prompts personalizados con preview en tiempo real
   - Inyección automática de source requirements
   - Preview final mostrando todos los prompts
   - Reemplazo automático de variables

### ⏳ Próxima Etapa

**Etapa 3: Procesamiento y Análisis de Respuestas**
- Procesadores de respuestas de LLMs
- Extracción de menciones, rankings, sentimiento
- Análisis de cumplimiento de fuentes
- Generación de métricas y scores

---

## 🎯 ETAPA 1: Estructura de Datos y Modelos (Fundación)
**Prioridad:** 🔴 CRÍTICA  
**Complejidad:** 🟡 Media  
**Duración:** 3-5 días  
**Estado:** ✅ COMPLETADA

### Objetivos
- Definir la estructura de datos completa para marcas, auditorías y resultados
- Crear tipos TypeScript para toda la aplicación
- Establecer el modelo de datos que soportará todas las funcionalidades

### Entregables
1. **Tipos TypeScript** (`types/`):
   - `BrandContext` - Información de la marca
   - `AuditConfig` - Configuración de auditoría
   - `PromptTemplate` - Estructura de prompts
   - `LLMResponse` - Respuestas de los LLMs
   - `AnalysisResult` - Resultados procesados
   - `SourceReference` - Referencias a páginas/fuentes

2. **Estructura de Datos**:
   ```typescript
   BrandContext {
     companyName, website, industry, region,
     description, keywords,
     sourceUrls: string[] // URLs que el LLM debe mencionar
     preferredCitations: string[] // Páginas específicas a citar
   }
   
   AuditConfig {
     models: LLMModel[],
     promptTemplates: PromptTemplate[],
     rankingDepth: number,
     competitors: string[],
     customPrompts: string[], // Prompts flexibles del usuario
     sourceRequirements: SourceRequirement[] // Qué fuentes debe usar
   }
   
   PromptTemplate {
     type: 'informative' | 'comparative' | 'opinion' | 'recommendation' | 'custom',
     baseTemplate: string,
     variables: string[],
     sourceRequirements?: string[] // URLs que debe mencionar
   }
   ```

3. **Validación con Zod**:
   - Schemas de validación para todos los tipos
   - Validación en frontend y preparación para backend

### Dependencias
- Ninguna (fundación)

---

## 🎯 ETAPA 2: Sistema de Prompts Flexible (El Corazón)
**Prioridad:** 🔴 CRÍTICA  
**Complejidad:** 🔴 Alta  
**Duración:** 5-7 días  
**Estado:** ✅ COMPLETADA

### Objetivos
- Construir el motor de generación de prompts
- Permitir prompts personalizados del usuario
- Integrar requerimientos de fuentes/citas
- Crear templates base inteligentes

### Entregables

1. **Motor de Prompts** (`lib/prompts/`):
   - `PromptBuilder` - Clase para construir prompts dinámicamente
   - `TemplateEngine` - Sistema de templates con variables
   - `SourceInjector` - Inyecta requerimientos de fuentes en prompts

2. **Templates Base**:
   ```typescript
   // Ejemplos de templates
   informative: "¿Qué es {brand}? {sourceRequirement}"
   comparative: "Compara {brand} con {competitors}. {sourceRequirement}"
   custom: "{userPrompt} {sourceRequirement}"
   ```

3. **UI Mejorada en Audits**:
   - Editor de prompts personalizados (textarea avanzado)
   - Selector de templates con preview
   - Gestión de fuentes requeridas (URLs que debe mencionar)
   - Preview del prompt final antes de ejecutar

4. **Gestión de Fuentes**:
   - Campo para agregar URLs que el LLM debe mencionar/citar
   - Validación de URLs
   - Categorización (página oficial, blog, reviews, etc.)

### Funcionalidades Clave
- **Prompts Flexibles**: El usuario puede escribir sus propios prompts
- **Inyección de Fuentes**: Automáticamente agrega "menciona estas URLs: X, Y, Z"
- **Templates Inteligentes**: Combina templates base con personalización
- **Preview**: Muestra cómo quedará el prompt antes de ejecutar

### Dependencias
- Etapa 1 (tipos de datos)

---

## 🎯 ETAPA 3: Procesamiento y Análisis de Respuestas (La Inteligencia)
**Prioridad:** 🔴 CRÍTICA  
**Complejidad:** 🔴 Alta  
**Duración:** 7-10 días  
**Estado:** ⏳ Pendiente

### Objetivos
- Procesar respuestas de LLMs y extraer insights
- Analizar menciones, rankings, sentimiento
- Detectar citas y referencias a fuentes
- Generar métricas y scores

### Entregables

1. **Procesadores de Respuestas** (`lib/analysis/`):
   - `ResponseParser` - Parsea respuestas de LLMs
   - `MentionExtractor` - Extrae menciones de marcas
   - `RankingAnalyzer` - Analiza posiciones en rankings
   - `SourceChecker` - Verifica si se mencionaron las fuentes requeridas
   - `SentimentAnalyzer` - Analiza sentimiento (básico)

2. **Métricas y Scores**:
   - **Perception Score**: 0-100 basado en menciones, ranking, sentimiento
   - **Source Compliance**: % de fuentes requeridas que fueron mencionadas
   - **Ranking Position**: Posición promedio en rankings
   - **Mention Frequency**: Frecuencia de menciones
   - **Competitor Comparison**: Comparación con competidores

3. **Estructura de Análisis**:
   ```typescript
   AnalysisResult {
     perceptionScore: number,
     ranking: {
       position: number,
       totalOptions: number,
       context: string
     },
     mentions: Mention[],
     sourceCompliance: {
       required: string[],
       mentioned: string[],
       missing: string[]
     },
     sentiment: 'positive' | 'neutral' | 'negative',
     keyConcepts: string[],
     competitorComparison: CompetitorComparison[]
   }
   ```

4. **Algoritmos de Análisis**:
   - Detección de rankings (listas numeradas, "top X", etc.)
   - Extracción de conceptos clave
   - Comparación con competidores
   - Detección de citas y referencias

### Dependencias
- Etapa 1 (tipos de datos)
- Etapa 2 (sistema de prompts)

---

## 🎯 ETAPA 4: Integración con LLMs (La Conexión)
**Prioridad:** 🟡 IMPORTANTE  
**Complejidad:** 🟡 Media  
**Duración:** 4-6 días  
**Estado:** ⏳ Pendiente

### Objetivos
- Conectar con APIs de LLMs principales
- Manejar rate limits y errores
- Implementar retry logic
- Procesar respuestas en tiempo real

### Entregables

1. **Clientes de LLM** (`lib/llm/`):
   - `OpenAIClient` - GPT-4, GPT-4 Turbo
   - `AnthropicClient` - Claude 3 Opus, Sonnet
   - `GoogleClient` - Gemini Pro, Ultra
   - `MetaClient` - Llama 3
   - `MistralClient` - Mistral Large

2. **Abstracción Unificada**:
   ```typescript
   interface LLMProvider {
     generate(prompt: string, config: LLMConfig): Promise<LLMResponse>
   }
   ```

3. **Manejo de Errores**:
   - Rate limiting
   - Retry con exponential backoff
   - Timeout handling
   - Error logging

4. **API Routes** (`app/api/`):
   - `/api/audit/run` - Ejecuta auditoría
   - `/api/llm/test` - Test de conexión con LLM
   - `/api/audit/status` - Estado de auditoría en progreso

5. **UI de Progreso**:
   - Loading states durante ejecución
   - Progress bar por modelo LLM
   - Manejo de errores en UI

### Configuración
- Variables de entorno para API keys
- Configuración de modelos disponibles
- Rate limits por proveedor

### Dependencias
- Etapa 1 (tipos de datos)
- Etapa 2 (sistema de prompts)
- Etapa 3 (procesamiento - para validar respuestas)

---

## 🎯 ETAPA 5: Dashboard y Visualizaciones Mejoradas
**Prioridad:** 🟡 IMPORTANTE  
**Complejidad:** 🟡 Media  
**Duración:** 4-5 días  
**Estado:** ⏳ Pendiente

### Objetivos
- Visualizar resultados de análisis
- Mostrar métricas clave
- Comparar entre modelos LLM
- Timeline de cambios

### Entregables

1. **Componentes de Visualización**:
   - `PerceptionScoreChart` - Gráfico de score por modelo
   - `RankingComparison` - Comparación de rankings
   - `SourceComplianceChart` - Cumplimiento de fuentes
   - `MentionTimeline` - Timeline de menciones
   - `CompetitorMatrix` - Matriz de comparación

2. **Dashboard Mejorado**:
   - Métricas principales destacadas
   - Gráficos interactivos
   - Filtros por modelo, fecha, tipo de prompt
   - Exportación de datos

3. **Página de Insights**:
   - Análisis detallado por prompt
   - Comparación lado a lado
   - Recomendaciones basadas en datos

### Dependencias
- Etapa 3 (análisis de datos)
- Etapa 4 (integración con LLMs)

---

## 🎯 ETAPA 6: Persistencia de Datos (Base de Datos)
**Prioridad:** 🟢 IMPORTANTE (pero puede esperar)  
**Complejidad:** 🟡 Media  
**Duración:** 5-7 días  
**Estado:** ⏳ Pendiente

### Objetivos
- Implementar base de datos
- Guardar auditorías y resultados
- Historial de análisis
- Comparación temporal

### Opciones de Base de Datos
1. **PostgreSQL + Prisma** (Recomendado)
   - Robusto, escalable
   - Buen soporte para relaciones
   - Migrations fáciles

2. **Supabase** (Alternativa rápida)
   - PostgreSQL como servicio
   - Auth incluido (para futuro)
   - Real-time capabilities

3. **MongoDB** (Si necesitas flexibilidad)
   - Schema flexible
   - Bueno para documentos JSON

### Entregables
1. **Schema de Base de Datos**:
   - Tablas: Users, Brands, Audits, Results, Prompts
   - Relaciones entre entidades
   - Índices para performance

2. **API de Persistencia**:
   - CRUD para auditorías
   - Guardado de resultados
   - Historial y versionado

3. **Migración desde SessionStorage**:
   - Mover datos temporales a BD
   - Mantener compatibilidad

### Dependencias
- Etapas 1-4 completadas
- Decisión de stack de BD

---

## 🎯 ETAPA 7: Autenticación y Usuarios
**Prioridad:** 🟢 BAJA (puede esperar)  
**Complejidad:** 🟡 Media  
**Duración:** 3-4 días  
**Estado:** ⏳ Pendiente

### Objetivos
- Sistema de autenticación
- Gestión de usuarios
- Múltiples marcas por usuario
- Planes y límites

### Opciones
1. **NextAuth.js** (Recomendado)
   - Integración fácil con Next.js
   - Múltiples proveedores (Google, GitHub, etc.)

2. **Supabase Auth** (Si usas Supabase)
   - Ya incluido en Supabase
   - Email/password + OAuth

3. **Clerk** (Alternativa moderna)
   - UI pre-construida
   - Muy fácil de implementar

### Entregables
1. **Sistema de Auth**:
   - Login/Register
   - Sesiones
   - Protección de rutas

2. **Gestión de Usuarios**:
   - Perfil de usuario
   - Múltiples marcas
   - Historial de auditorías

3. **UI de Auth**:
   - Páginas de login/register
   - Protección de rutas
   - Logout

### Dependencias
- Etapa 6 (base de datos)

---

## 📊 Resumen de Prioridades

### ✅ COMPLETADO
1. **Etapa 1**: Estructura de Datos ✅
2. **Etapa 2**: Sistema de Prompts ✅

### 🔴 CRÍTICO (Siguiente)
3. **Etapa 3**: Procesamiento y Análisis

### 🟡 IMPORTANTE (Después)
4. **Etapa 4**: Integración con LLMs
5. **Etapa 5**: Dashboard Mejorado

### 🟢 PUEDE ESPERAR
6. **Etapa 6**: Base de Datos
7. **Etapa 7**: Autenticación

---

## 🚀 Plan de Ejecución Recomendado

### ✅ Sprint 1 (Completado)
- ✅ Etapa 1: Estructura de Datos
- ✅ Etapa 2: Sistema de Prompts

### Sprint 2 (Próximo - 2 semanas)
- ⏳ Etapa 3: Procesamiento y Análisis (inicio)
- ⏳ Etapa 3: Procesamiento y Análisis (completar)

### Sprint 3 (2 semanas)
- ⏳ Etapa 4: Integración con LLMs

### Sprint 4 (1-2 semanas)
- ⏳ Etapa 5: Dashboard Mejorado
- ⏳ Testing y refinamiento

### Sprint 5+ (Futuro)
- ⏳ Etapa 6: Base de Datos
- ⏳ Etapa 7: Autenticación

---

## 📝 Notas Importantes

1. **Prompts Flexibles**: Esta es la funcionalidad diferenciadora. Invertir tiempo en hacerlo bien.

2. **Fuentes y Citas**: Permitir que el usuario defina qué páginas debe mencionar el LLM es crítico para validar el posicionamiento.

3. **Análisis Inteligente**: El procesamiento de respuestas debe ser robusto para extraer insights valiosos.

4. **MVP First**: Enfocarse en hacer funcionar el flujo completo end-to-end antes de agregar features avanzadas.

5. **Testing**: Probar con datos reales desde el principio para validar que los prompts y análisis funcionan correctamente.

---

## 🔄 Actualizaciones

### Última actualización: [Fecha actual]

**Progreso completado:**
- ✅ **Etapa 1**: Estructura de Datos y Modelos - COMPLETADA
  - Tipos TypeScript completos
  - Schemas de validación Zod implementados
  - Formularios actualizados con nuevos campos (sourceUrls, preferredCitations)
  - Validación en tiempo real funcionando
  
- ✅ **Etapa 2**: Sistema de Prompts Flexible - COMPLETADA
  - Motor de prompts (PromptBuilder, TemplateEngine, SourceInjector) implementado
  - Editor de prompts personalizados con preview en tiempo real
  - Inyección automática de source requirements
  - Preview final mostrando todos los prompts
  - Reemplazo automático de variables ({brand}, {industry}, etc.)

**Próximos pasos:**
- ⏳ **Etapa 3**: Procesamiento y Análisis de Respuestas
  - Procesadores de respuestas de LLMs
  - Extracción de menciones, rankings, sentimiento
  - Análisis de cumplimiento de fuentes
  - Generación de métricas y scores

---

Este roadmap es un documento vivo. Se actualizará según:
- Feedback de usuarios
- Cambios en prioridades
- Nuevos requerimientos
- Aprendizajes durante desarrollo
