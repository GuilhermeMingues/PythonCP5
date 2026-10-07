import time
import subprocess
import sys

INTERVALO = 30 * 60

while True:
    print("Atualizando vagas...")

    resultado = subprocess.run([
        sys.executable,
        "-m",
        "crawler.crawler"
    ])

    if resultado.returncode == 0:
        print("Atualização concluída.")
    else:
        print("Erro ao atualizar as vagas.")

    print("Próxima atualização em 30 minutos.")
    time.sleep(INTERVALO)