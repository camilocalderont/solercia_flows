# 🚀 Guía de Integración de Flujos Dinámicos

## 📋 Resumen Ejecutivo

Esta guía documenta la implementación completa del sistema de **Flujos Dinámicos** para el ecosistema Boki, integrando tanto `boki-bot` (Python) como `boki-api` (Node.js/TypeScript) en una arquitectura distribuida y robusta.

## 🏗️ Arquitectura General

### **Distribución de Responsabilidades**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   BOKI-BOT      │    │    BOKI-API     │    │   BASE DE DATOS │
│   (Python)      │    │  (Node.js/TS)   │    │  (PostgreSQL)   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Conversación  │◄──►│ • Gestión       │◄──►│ • Definiciones  │
│ • WhatsApp      │    │ • Ejecución     │    │ • Configuración │
│ • Orquestación  │    │ • Validación    │    │ • Estado        │
│ • Fallbacks     │    │ • Templates     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Flujo de Procesamiento**

1. **WhatsApp** → `boki-bot` recibe mensaje
2. **Decisión** → ¿Usar flujos dinámicos?
3. **Procesamiento** → `boki-api` ejecuta flujo dinámico
4. **Respuesta** → `boki-bot` envía respuesta a WhatsApp
5. **Estado** → Sincronización entre sistemas

## 🔧 Implementación Técnica

### **1. 🔗 BOKI-API: Extensiones Implementadas**

#### **Nuevos Endpoints**
```typescript
POST   /dynamic-flows/execution/process-message
GET    /dynamic-flows/execution/flow-state/{contactId}
PUT    /dynamic-flows/execution/flow-state/{contactId}
DELETE /dynamic-flows/execution/flow-state/{contactId}
POST   /dynamic-flows/execution/validate-expression
POST   /dynamic-flows/execution/process-template
GET    /dynamic-flows/execution/flow-definition/{companyId}/{flowName}
POST   /dynamic-flows/execution/execute-tools
```

#### **Componentes Principales**
- **FlowExecutionController**: Maneja requests de ejecución
- **FlowExecutionService**: Lógica de procesamiento de flujos
- **ExpressionValidator**: Validación de expresiones JavaScript-like
- **TemplateProcessor**: Procesamiento de templates {{ }}

### **2. 🤖 BOKI-BOT: Sistema Híbrido**

#### **Estructura Implementada**
```
app/dynamic_flows/
├── domain/
│   ├── entities/flow_context.py
│   └── services/
│       ├── expression_evaluator.py
│       └── template_processor.py
├── application/
│   ├── services/
│   │   ├── dynamic_flow_orchestrator.py
│   │   └── hybrid_flow_orchestrator.py
│   └── use_cases/
│       ├── process_flow_message.py
│       ├── get_flow_definition.py
│       ├── save_flow_state.py
│       └── execute_flow_tools.py
├── infrastructure/
│   └── external/
│       └── boki_api_dynamic_adapter.py
└── presentation/
    └── conversation_integration.py
```

#### **Componentes Principales**
- **HybridFlowOrchestrator**: Coordina entre sistemas local y remoto
- **BokiApiDynamicAdapter**: Comunicación con boki-api
- **DynamicFlowsIntegration**: Integración con ConversationManager

## 🔄 Integración con ConversationManager

### **Código de Integración**

```python
# En conversation_manager.py
from app.dynamic_flows import DynamicFlowsIntegration

class ConversationManager:
    def __init__(self):
        # ... código existente ...
        self.dynamic_flows = DynamicFlowsIntegration(
            mode="remote_first",
            boki_api_url="http://localhost:3000/api"
        )
    
    async def initialize(self):
        # ... código existente ...
        await self.dynamic_flows.initialize()
    
    async def process_message(self, contact_id, message_text, ...):
        # Verificar si usar flujos dinámicos
        if await self.dynamic_flows.should_use_dynamic_flow(
            contact_id, message_text, company_id
        ):
            return await self.dynamic_flows.process_message(
                contact_id, message_text, company_id
            )
        else:
            # Sistema legacy existente
            self.dynamic_flows.increment_legacy_usage()
            return await self.flow_router.route_message(...)
```

## 🚦 Modos de Operación

### **1. Remote-First (Recomendado)**
- **Principal**: boki-api procesa flujos
- **Fallback**: Sistema Python local
- **Ventajas**: Centralización, configuración dinámica
- **Desventajas**: Dependencia de red

### **2. Local-First**
- **Principal**: Sistema Python local
- **Fallback**: boki-api remoto
- **Ventajas**: Mayor control, menor latencia
- **Desventajas**: Duplicación de lógica

### **3. Hybrid**
- **Estrategia**: Combinación inteligente
- **Decisión**: Basada en disponibilidad y configuración
- **Ventajas**: Máxima flexibilidad
- **Desventajas**: Mayor complejidad

## 📊 Configuración de Flujos

### **Ejemplo de Flujo de Agendamiento**

```json
{
  "VcFlowName": "ai_appointment",
  "VcDisplayName": "Agendamiento con IA",
  "JsonFlowConfig": {
    "max_steps": 6,
    "timeout_minutes": 30,
    "required_fields": ["ServiceId", "ProfessionalId", "DtDate", "TStartTime"]
  },
  "Steps": [
    {
      "VcStepKey": "initial",
      "IStepOrder": 1,
      "TxExecutionCondition": "$flowInfo.currentStep === 'initial'",
      "TxStepOutput": "🤖 ¡Hola! ¿Qué servicio te gustaría agendar? {{ services_text }}"
    }
  ],
  "Conditions": [
    {
      "VcConditionKey": "allDataComplete",
      "TxConditionExpression": "$flowInfo.hasCategory && $flowInfo.hasService && $flowInfo.hasDateTime"
    }
  ],
  "Tools": [
    {
      "VcToolType": "api_call",
      "VcToolName": "get_categories",
      "JsonToolConfig": {
        "endpoint": "/api/services",
        "method": "GET"
      }
    }
  ]
}
```

## 🛠️ Instalación y Configuración

### **1. Configuración de boki-api**

```bash
cd boki-api/
npm install

# Agregar al app.module.ts
import { DynamicFlowsModule } from './modules/dynamic_flows/dynamic-flows.module';

@Module({
  imports: [
    // ... módulos existentes ...
    DynamicFlowsModule
  ]
})
```

### **2. Configuración de boki-bot**

```bash
cd boki-bot/
pip install httpx  # Si no está instalado

# Configurar variables de entorno
echo "BOKI_API_URL=http://localhost:3000/api" >> .env
echo "DYNAMIC_FLOWS_ENABLED=true" >> .env
echo "DYNAMIC_FLOWS_MODE=remote_first" >> .env
```

### **3. Configuración de Base de Datos**

```bash
# Ejecutar migraciones (ya implementadas)
cd boki-api/
npm run migration:run

# Ejecutar seeds de ejemplo
npm run seed:run
```

## 🧪 Testing

### **Test de Integración Básico**

```python
# test_dynamic_flows_integration.py
import pytest
from app.dynamic_flows import DynamicFlowsIntegration

@pytest.mark.asyncio
async def test_dynamic_flows_integration():
    integration = DynamicFlowsIntegration(
        boki_api_url="http://localhost:3000/api"
    )
    
    # Inicializar
    initialized = await integration.initialize()
    assert initialized == True
    
    # Verificar decisión de flujo dinámico
    should_use = await integration.should_use_dynamic_flow(
        "test_contact", "quiero agendar una cita", 1
    )
    assert should_use == True
    
    # Procesar mensaje
    result = await integration.process_message(
        "test_contact", "quiero agendar una cita", 1
    )
    
    state, response, completed = result
    assert response is not None
    assert isinstance(state, dict)
    assert isinstance(completed, bool)
```

## 📈 Monitoreo y Métricas

### **Estadísticas Disponibles**

```python
# Obtener estadísticas de uso
stats = integration.get_statistics()
print(f"Flujos dinámicos: {stats['dynamic_flows_used']}")
print(f"Flujos legacy: {stats['legacy_flows_used']}")
print(f"Porcentaje dinámico: {stats['dynamic_flows_percentage']:.2f}%")

# Estado del sistema
status = await integration.get_integration_status()
print(f"Sistema saludable: {status['orchestrator_status']['overall_healthy']}")
```

## 🔍 Troubleshooting

### **Problemas Comunes**

1. **Error de conexión con boki-api**
   ```
   Solución: Verificar que boki-api esté ejecutándose en el puerto correcto
   ```

2. **Flujos dinámicos no se activan**
   ```
   Solución: Verificar configuración DYNAMIC_FLOWS_ENABLED=true
   ```

3. **Expresiones no evalúan correctamente**
   ```
   Solución: Usar endpoint /validate-expression para debug
   ```

### **Logs Importantes**

```bash
# Verificar logs de inicialización
grep "DynamicFlowsIntegration" boki-bot/logs/app.log

# Verificar logs de procesamiento
grep "proceso_message" boki-bot/logs/app.log

# Verificar logs de boki-api
grep "FlowExecutionService" boki-api/logs/app.log
```

## 🚀 Roadmap Futuro

### **Próximas Mejoras**

1. **Dashboard de Administración**
   - Interfaz web para gestionar flujos
   - Métricas en tiempo real
   - Configuración visual

2. **Inteligencia Artificial Avanzada**
   - Integración con OpenAI/Claude
   - Procesamiento de lenguaje natural
   - Respuestas contextuales

3. **Escalabilidad**
   - Cache distribuido (Redis)
   - Load balancing
   - Microservicios

4. **Integración Multicanal**
   - Telegram, Instagram, Facebook
   - APIs unificadas
   - Configuración por canal

## 📞 Soporte

Para soporte técnico:
- **Documentación**: Este archivo
- **Logs**: Revisar archivos de log en ambos sistemas
- **Testing**: Usar endpoints de validación para debug
- **Monitoreo**: Verificar métricas de salud del sistema

---

*Documentación generada automáticamente - Versión 1.0.0*