curl -O -L  https://github.com/nervosnetwork/neuron/releases/download/v0.111.1/Neuron-v0.111.1-setup.exe
@echo off
REM 执行安装程序
.\Neuron-v0.111.1-setup.exe /S /D=D:\a\ckb-neuron-sync-test\ckb-neuron-sync-test\neuron

REM 等待进程执行结束
:CHECK_LOOP
tasklist | find "Neuron-v0.111.1-setup.exe" > nul
if errorlevel 1 (
    echo Neuron install succ
    exit /b 0
) else (
    timeout /t 5 /nobreak > nul
    goto :CHECK_LOOP
)