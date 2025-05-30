ARG PYTHON_IMAGE_VERSION=3.13

FROM python:3.13-alpine AS build

RUN apk update && \
    apk add --no-cache \
        gcc musl-dev python3-dev openldap-dev cyrus-sasl-dev libffi-dev pkgconf mariadb-dev && \
        pip install --upgrade pip==25.0.1

RUN pip install \
    Django \
    djangorestframework \
    drf-spectacular \
    django-mysql \
    mysqlclient \
    uwsgi \
    django-auth-ldap \
    Pillow \
    djangorestframework-simplejwt

FROM python:3.13-alpine AS runtime

ARG PYTHON_IMAGE_VERSION=3.13

VOLUME [ "/var/run/python" ]

WORKDIR /var/www/backend

ENV PYTHON_IMAGE_VERSION=${PYTHON_IMAGE_VERSION} \
    SOCK_PATH=/var/run/python/uwsgi.sock \
    WSGI_FILE_PATH=/var/www/backend/main/wsgi.py \
    WSGI_PROCESSES=4


RUN apk update && apk add --no-cache openldap mariadb-connector-c

COPY --from=build /usr/local/lib/python${PYTHON_IMAGE_VERSION}/site-packages /usr/local/lib/python${PYTHON_IMAGE_VERSION}/site-packages
COPY --from=build /usr/local/bin/uwsgi /usr/local/bin/

CMD ["sh", "-c", "uwsgi --master --die-on-term --protocol uwsgi --wsgi-file $WSGI_FILE_PATH --socket $SOCK_PATH --chmod-socket=666 --processes=$WSGI_PROCESSES"]