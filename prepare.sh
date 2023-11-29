tar -zxvf source.tar.gz
bash script/download-ckb.sh $1
git clone https://github.com/nervosnetwork/neuron.git
cd neuron
yarn global add lerna
yarn
lerna run rebuild:nativemodules
echo "prepare successful"