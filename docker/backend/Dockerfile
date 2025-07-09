ARG PYTHON_IMAGE_VERSION=3.13

FROM python:${PYTHON_IMAGE_VERSION}-slim AS build

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  build-essential pkg-config python3-dev libldap2-dev libsasl2-dev libffi-dev libmariadb-dev

RUN pip install --upgrade pip

RUN pip install \
  Django \
  djangorestframework \
  drf-spectacular \
  django-mysql \
  mysqlclient \
  uwsgi \
  django-auth-ldap \
  Pillow \
  pymongo \
  drf-spectacular \
  django-cors-headers \
  requests \
  channels[daphne] \
  openpyxl

FROM python:${PYTHON_IMAGE_VERSION}-slim AS runtime

ARG PYTHON_IMAGE_VERSION

VOLUME [ "/var/run/python" ]

WORKDIR /var/www/backend

ENV PYTHON_IMAGE_VERSION=${PYTHON_IMAGE_VERSION} \
  SOCK_PATH=/var/run/python/uwsgi.sock \
  WSGI_FILE_PATH=/var/www/backend/main/wsgi.py \
  WSGI_PROCESSES=4


RUN apt-get update && apt-get install -y --no-install-recommends libldap-2.5-0 libmariadb3

COPY --from=build /usr/local/lib/python${PYTHON_IMAGE_VERSION}/site-packages /usr/local/lib/python${PYTHON_IMAGE_VERSION}/site-packages
COPY --from=build /usr/local/bin/uwsgi /usr/local/bin/

CMD ["sh", "-c", "uwsgi --master --die-on-term --protocol uwsgi --wsgi-file $WSGI_FILE_PATH --socket $SOCK_PATH --chmod-socket=666 --processes=$WSGI_PROCESSES"]