FROM node:lts-hydrogen as node-builder

WORKDIR /opt/matchyosports-web-app
COPY ./web-app/package.json ./web-app/yarn.lock ./
RUN yarn install
COPY ./web-app ./
RUN yarn run build-docker

FROM python:3.11-bullseye

WORKDIR /opt/matchyosports
COPY pyproject.toml poetry.lock ./
RUN pip install poetry
RUN poetry config virtualenvs.in-project true
RUN poetry install --no-root

COPY . .
COPY --from=node-builder /opt/matchyosports-web-app/dist/web-app-bundle.js ./static/js/
RUN poetry install --no-dev

CMD ["poetry", "run", "waitress-serve", "app:app"]
