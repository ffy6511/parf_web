# hello.py
import sys

def say_hello(name):
    return f"Hello, {name}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: No name provided")
        sys.exit(1)
    name = sys.argv[1]
    print(say_hello(name))
