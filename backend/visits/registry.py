import logging

from django.conf import settings
from django.utils.module_loading import import_string

logger = logging.getLogger(__name__)

_PLUGINS = {}
_USER_ADMIN_INLINES = []


def register_plugins():
    """
    Register all plugins defined in the VISITS_PLUGINS setting.
    """

    plugins_congfs = getattr(settings, "VISITS_PLUGINS", {})

    for plugin_group, plugins in plugins_congfs.items():
        for plugin_path in plugins:
            try:
                plugin_cls = import_string(plugin_path)
                _PLUGINS.setdefault(plugin_group, []).append(plugin_cls)
                logger.info(
                    f"Registered plugin '{plugin_path}' under group '{plugin_group}'."
                )
            except ImportError as e:
                logger.error(f"Failed to import plugin '{plugin_path}': {e}")


def get_plugins(group: str):
    """
    Retrieve all plugins registered under the specified group.
    """

    return _PLUGINS.get(group, [])


def get_user_admin_inlines():
    """
    Retrieve all user admin inlines registered via the @register_user_admin_inline decorator.
    """
    return _USER_ADMIN_INLINES


def register_user_admin_inline(cls):
    """
    Decorator to register a user admin inline class.
    """
    _USER_ADMIN_INLINES.append(cls)

    return cls
