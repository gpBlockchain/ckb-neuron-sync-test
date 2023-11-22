echo "todo download ckb source/bin"
#bash script/download-ckb.sh $1
echo "todo download neuron"
git clone https://github.com/nervosnetwork/neuron.git
cd neuron
yarn global add lerna
yarn
lerna run rebuild:nativemodules
echo "todo download source:ckb data "