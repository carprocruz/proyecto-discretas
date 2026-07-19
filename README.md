# Nodo & Arista — Teoría de Grafos interactiva

Proyecto web para la enseñanza de la Teoría de Grafos con una estructura modular orientada a componentes, algoritmos, modelos y documentación.

## Estructura del proyecto

```text
proyecto-discretas/
├── docs/                 # requerimientos, casos de uso, arquitectura y manual
├── public/               # recursos estáticos como logo y favicon
├── src/                  # código fuente principal del proyecto
│   ├── algorithms/       # lógica de recorrido y algoritmos
│   ├── components/       # UI reutilizable por secciones
│   ├── pages/            # vistas principales del simulador
│   ├── services/         # acceso a datos y representaciones
│   ├── styles/           # estilos globales
│   └── types/            # definiciones TypeScript
├── tests/                # pruebas de algoritmos y modelos
└── README.md             # documentación general del proyecto
```

## Organización actual

- La implementación previa de la interfaz se conserva en la carpeta de algoritmos como referencia.
- La estructura nueva está preparada para evolucionar a una aplicación más modular.
- Los archivos innecesarios del prototipo inicial se han dejado fuera del árbol principal para simplificar el proyecto.

