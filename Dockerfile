FROM node:22-alpine AS build
WORKDIR /app

ARG NEXT_PUBLIC_INVENTORY_API_URL
ARG NEXT_PUBLIC_VENTAS_API_URL
ARG NEXT_PUBLIC_COMPRAS_API_URL

ENV NEXT_PUBLIC_INVENTORY_API_URL=${NEXT_PUBLIC_INVENTORY_API_URL}
ENV NEXT_PUBLIC_VENTAS_API_URL=${NEXT_PUBLIC_VENTAS_API_URL}
ENV NEXT_PUBLIC_COMPRAS_API_URL=${NEXT_PUBLIC_COMPRAS_API_URL}

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=80
ENV HOSTNAME="0.0.0.0"

# Copy standalone output
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 80

CMD ["node", "server.js"]
