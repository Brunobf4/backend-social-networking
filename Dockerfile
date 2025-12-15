# use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
# RUN bun test
# DATABASE_URL is required for prisma.config.ts to load, even if not used for generation
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" bun run prisma generate

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/node_modules/.prisma node_modules/.prisma
COPY --from=prerelease /usr/src/app/src src
COPY --from=prerelease /usr/src/app/package.json .
# Copy config for Prisma 7
COPY --from=prerelease /usr/src/app/prisma.config.ts .
COPY --from=prerelease /usr/src/app/prisma prisma

# run the app
USER bun
EXPOSE 3000/tcp
CMD [ "bun", "run", "src/index.ts" ]
