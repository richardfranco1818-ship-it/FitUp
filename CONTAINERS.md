# Uso de Contenedores — FitUp

## Arquitectura con Docker

FitUp implementa el patrón **offline-first** donde la app móvil siempre guarda
primero en local (AsyncStorage) y sincroniza con el backend cuando hay conexión.

El backend es **Supabase**, una plataforma que internamente corre en contenedores Docker: