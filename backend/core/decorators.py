import cProfile
import pstats

def profile(func):
    def wrapper(*args, **kwargs):
        profile = cProfile.Profile()
        try:
            return profile.runcall(func, *args, **kwargs)
        finally:
            ps = pstats.Stats(profile)
            ps.sort_stats('cumulative')
            ps.print_stats()
    return wrapper
