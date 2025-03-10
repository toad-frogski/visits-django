ARG VERSION=slim

FROM registry.deeplace.md/deeplace-infrastructure/python-django:${VERSION} AS build

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc pkg-config python3-dev libldap2-dev libsasl2-dev

RUN pip install django-auth-ldap djangorestframework-simplejwt

FROM registry.deeplace.md/deeplace-infrastructure/python-django:${VERSION} AS runtime

RUN apt-get update && apt-get -y install libldap-2.5-0

COPY --from=build /usr/local/lib/python${PYTHON_IMAGE_VERSION}/site-packages /usr/local/lib/python${PYTHON_IMAGE_VERSION}/site-packages
