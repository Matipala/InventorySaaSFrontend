FROM node:22-alpine AS build
WORKDIR /app

ARG VITE_INVENTORY_URL
ARG VITE_VENTAS_URL
ARG VITE_COMPRAS_URL

ENV VITE_INVENTORY_URL=${VITE_INVENTORY_URL}
ENV VITE_VENTAS_URL=${VITE_VENTAS_URL}
ENV VITE_COMPRAS_URL=${VITE_COMPRAS_URL}

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
