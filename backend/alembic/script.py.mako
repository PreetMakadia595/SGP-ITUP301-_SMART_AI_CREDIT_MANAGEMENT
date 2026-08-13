"""Generic single-database configuration."""
from alembic.script import ScriptDirectory


def process_revision_directives(context, revision, directives):
    if config.cmd_opts and hasattr(config.cmd_opts, 'autogenerate'):
        if config.cmd_opts.autogenerate:
            script = directives[0]
            if script.upgrade_ops.is_empty():
                directives[:] = []


from env import *
