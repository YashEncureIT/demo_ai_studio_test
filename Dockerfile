# ==========================================
# 1. BASE DEPS stage (to share cache)
# ==========================================
FROM node:22-alpine AS base

WORKDIR /app

# Ensure we have clean package files copied
COPY package.json package-lock.json* ./


# ==========================================
# 2. DEVELOPMENT Target Stage
# ==========================================
FROM base AS development

# Install ALL packages (including devDependencies like tsx, typescript, vite, etc.)
RUN npm install

# Expose the default development service port
EXPOSE 3000

# Start tsx server with Vite developer middleware
CMD ["npm", "run", "dev"]


# ==========================================
# 3. BUILDER stage (To compile source)
# ==========================================
FROM base AS builder

# Install all packages for compilation
RUN npm install

# Copy source code files
COPY . .

# Run compilation script producing dist/ folder content
RUN npm run build


# ==========================================
# 4. PRODUCTION Target Stage
# ==========================================
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package.json package-lock.json* ./

# Install ONLY production dependencies to keep the final image minimal and secure
RUN npm install --omit=dev

# Copy compiled resources from builder stage
COPY --from=builder /app/dist ./dist

# Expose production port
EXPOSE 3000

# Start self-contained compiled server wrapper
CMD ["npm", "run", "start"]
